import Gym from '../models/Gym.js'
import User from '../models/User.js'
import { geocodeGym } from '../utils/geocode.js'

export const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ city: 1, name: 1 })
    res.json(gyms)
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

    const { name, city, phone, website, description, address } = req.body
    const updates = {}
    if (name        !== undefined) updates.name        = name.trim()
    if (city        !== undefined) updates.city        = city.trim()
    if (phone       !== undefined) updates.phone       = phone.trim()
    if (website     !== undefined) updates.website     = website.trim()
    if (description !== undefined) updates.description = description.trim()
    if (address     !== undefined) updates.address     = address.trim()

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
    const gym = await Gym.findById(req.params.id)
    if (!gym) return res.status(404).json({ message: 'Gym not found' })

    const members = await User.find({ gymId: gym._id }).select('-password')
    const coaches  = members.filter((m) => m.role === 'coach')
    const fighters = members.filter((m) => m.role === 'fighter')

    res.json({ ...gym.toObject(), coaches, fighters })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
