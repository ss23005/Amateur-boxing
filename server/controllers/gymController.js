import Gym from '../models/Gym.js'
import User from '../models/User.js'
import { geocodeGym } from '../utils/geocode.js'
import { uploadImage } from '../utils/cloudinary.js'

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
      { $match: { gymId: { $in: gymIds }, status: 'approved' } },
      { $group: { _id: { gymId: '$gymId', role: '$role' }, n: { $sum: 1 } } },
    ])
    const countMap = {}
    for (const { _id: { gymId, role }, n } of counts) {
      const key = String(gymId)
      if (!countMap[key]) countMap[key] = { fighterCount: 0, coachCount: 0 }
      if (role === 'fighter') countMap[key].fighterCount = n
      if (role === 'coach')   countMap[key].coachCount   = n
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

    const { name, city, phone, website, description, address, brandColor, logo: logoBase64 } = req.body
    const updates = {}
    if (name        !== undefined) updates.name        = name.trim()
    if (city        !== undefined) updates.city        = city.trim()
    if (phone       !== undefined) updates.phone       = phone.trim()
    if (website     !== undefined) updates.website     = website.trim()
    if (description !== undefined) updates.description = description.trim()
    if (address     !== undefined) updates.address     = address.trim()
    if (brandColor  !== undefined) updates.brandColor  = brandColor

    // Logo update: try Cloudinary, fall back to base64
    if (logoBase64) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                            process.env.CLOUDINARY_API_KEY    &&
                            process.env.CLOUDINARY_API_SECRET
      if (hasCloudinary) {
        try {
          const base64Data = logoBase64.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')
          updates.logo = await uploadImage(buffer, 'gym-logos')
        } catch {
          updates.logo = logoBase64
        }
      } else {
        updates.logo = logoBase64
      }
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
    const coaches  = members.filter((m) => m.role === 'coach')
    const fighters = members.filter((m) => m.role === 'fighter')

    res.json({ ...gym.toObject(), coaches, fighters })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
