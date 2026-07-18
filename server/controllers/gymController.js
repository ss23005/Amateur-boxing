import Gym from '../models/Gym.js'
import User from '../models/User.js'
import { geocodeGym } from '../utils/geocode.js'
import { uploadImage } from '../utils/cloudinary.js'
import { sendJoinRequestEmail } from '../utils/email.js'

export const getGyms = async (req, res) => {
  try {
    const userId    = req.user?._id
    const userGymId = req.user?.gymId
    // ?all=true is used during signup so fighters can find pending gyms
    const includeAll = req.query.all === 'true'

    let query
    if (includeAll) {
      query = { status: { $ne: 'denied' } }
    } else if (userId) {
      // Always show a user their own gym even if it's still pending
      const pendingClauses = [{ status: 'pending', createdBy: userId }]
      if (userGymId) pendingClauses.push({ status: 'pending', _id: userGymId })
      query = { $or: [{ status: { $ne: 'pending' } }, ...pendingClauses] }
    } else {
      query = { status: { $ne: 'pending' } }
    }
    const gyms = await Gym.find(query).select('-logo').sort({ city: 1, name: 1 }).lean()

    // Attach approved member counts without N+1 queries
    const gymIds = gyms.map(g => g._id)
    const counts = await User.aggregate([
      { $match: { gymId: { $in: gymIds }, status: 'approved', gymJoinStatus: 'approved' } },
      { $group: { _id: { gymId: '$gymId', role: '$role' }, n: { $sum: 1 } } },
    ])
    const countMap = {}
    for (const { _id: { gymId, role }, n } of counts) {
      const key = String(gymId)
      if (!countMap[key]) countMap[key] = { fighterCount: 0, coachCount: 0 }
      if (role === 'fighter') countMap[key].fighterCount = n
      if (role === 'gym')     countMap[key].coachCount   = n
    }

    const result = gyms.map(g => ({
      ...g,
      fighterCount: countMap[String(g._id)]?.fighterCount ?? 0,
      coachCount:   countMap[String(g._id)]?.coachCount   ?? 0,
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const searchGym = async (req, res) => {
  const { name } = req.query
  if (!name) return res.json({ gym: null })
  try {
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const gym = await Gym.findOne({ name: { $regex: new RegExp(`^${escaped}$`, 'i') } })
    res.json({ gym: gym || null })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateGym = async (req, res) => {
  try {
    // Only a coach whose gymId matches this gym can update it
    if (!req.user.gymId || String(req.user.gymId) !== req.params.id) {
      return res.status(403).json({ message: 'Not authorised to edit this gym' })
    }

    const { name, city, postcode, country, phone, website, email, description, address, brandColor, logo: logoInput, gallery: galleryInput } = req.body
    const updates = {}
    if (name        !== undefined) updates.name        = name.trim()
    if (city        !== undefined) updates.city        = city.trim()
    if (postcode    !== undefined) updates.postcode    = postcode.trim()
    if (country     !== undefined) updates.country     = country.trim()
    if (phone       !== undefined) updates.phone       = phone.trim()
    if (website     !== undefined) updates.website     = website.trim()
    if (email       !== undefined) updates.email       = email.trim()
    if (description !== undefined) updates.description = description.trim()
    if (address     !== undefined) updates.address     = address.trim()
    if (brandColor  !== undefined) updates.brandColor  = brandColor

    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                          process.env.CLOUDINARY_API_KEY    &&
                          process.env.CLOUDINARY_API_SECRET

    // Logo: upload if new base64, keep if existing URL, clear if empty string
    if (logoInput !== undefined) {
      if (!logoInput) {
        updates.logo = ''
      } else if (logoInput.startsWith('data:')) {
        try {
          const buffer = Buffer.from(logoInput.replace(/^data:image\/\w+;base64,/, ''), 'base64')
          updates.logo = hasCloudinary ? await uploadImage(buffer, 'gym-logos') : logoInput
        } catch { updates.logo = logoInput }
      } else {
        updates.logo = logoInput // existing URL unchanged
      }
    }

    // Gallery: process each image — upload new ones, keep existing URLs
    if (Array.isArray(galleryInput)) {
      const processed = []
      for (const img of galleryInput.slice(0, 6)) {
        if (!img) continue
        if (img.startsWith('data:')) {
          try {
            const buffer = Buffer.from(img.replace(/^data:image\/\w+;base64,/, ''), 'base64')
            processed.push(hasCloudinary ? await uploadImage(buffer, 'gym-gallery') : img)
          } catch { processed.push(img) }
        } else {
          processed.push(img) // existing URL
        }
      }
      updates.gallery = processed
    }

    // Re-geocode whenever address/city/country-relevant fields change
    const existing = await Gym.findById(req.params.id)
    const merged = { ...existing?.toObject(), ...updates }
    const coords = await geocodeGym(merged)
    if (coords) updates.coordinates = coords

    const gym = await Gym.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    res.json(gym)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getGym = async (req, res) => {
  try {
    const param = req.params.id
    // Try slug first; fall back to ObjectId so internal lookups by _id still work
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(param)
    const gym = isObjectId
      ? (await Gym.findOne({ slug: param })) ?? (await Gym.findById(param))
      : await Gym.findOne({ slug: param })
    if (!gym) return res.status(404).json({ message: 'Gym not found' })

    const members = await User.find({ gymId: gym._id, status: 'approved' }).select('-password')
    const coaches  = members.filter((m) => m.role === 'gym')
    const fighters = members.filter((m) => m.role === 'fighter' && m.gymJoinStatus === 'approved')

    res.json({ ...gym.toObject(), coaches, fighters })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getJoinRequests = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    if (!req.user.gymId || String(req.user.gymId) !== String(gym._id)) {
      return res.status(403).json({ message: 'Not authorised' })
    }
    const requests = await User.find({
      gymId: gym._id,
      gymJoinStatus: 'pending',
      role: 'fighter',
    }).select('name username avatar role record weightClass location gymJoinStatus createdAt')
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const approveJoinRequest = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    if (!req.user.gymId || String(req.user.gymId) !== String(gym._id)) {
      return res.status(403).json({ message: 'Not authorised' })
    }
    const fighter = await User.findOneAndUpdate(
      { _id: req.params.userId, gymId: gym._id, gymJoinStatus: 'pending' },
      { $set: { gymJoinStatus: 'approved' } },
      { new: true }
    )
    if (!fighter) return res.status(404).json({ message: 'Request not found' })
    res.json({ message: 'Approved' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const rejectJoinRequest = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    if (!req.user.gymId || String(req.user.gymId) !== String(gym._id)) {
      return res.status(403).json({ message: 'Not authorised' })
    }
    await User.findOneAndUpdate(
      { _id: req.params.userId, gymId: gym._id, gymJoinStatus: 'pending' },
      { $set: { gymId: null, gymJoinStatus: 'rejected' } }
    )
    res.json({ message: 'Rejected' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const requestJoin = async (req, res) => {
  try {
    if (req.user.role !== 'fighter') {
      return res.status(403).json({ message: 'Only fighters can request to join a gym' })
    }
    const gym = await Gym.findById(req.params.id)
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    if (req.user.gymJoinStatus === 'pending' || req.user.gymJoinStatus === 'approved') {
      return res.status(400).json({ message: 'Already in or pending a gym' })
    }
    await User.findByIdAndUpdate(req.user._id, {
      $set: { gymId: gym._id, gymJoinStatus: 'pending' },
    })

    // Notify the gym owner
    const gymOwner = await User.findOne({ gymId: gym._id, role: 'gym' })
    if (gymOwner) sendJoinRequestEmail(gymOwner, req.user, gym).catch(() => {})

    res.json({ message: 'Request sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
