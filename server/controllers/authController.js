import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Fighter from '../models/Fighter.js'
import Gym from '../models/Gym.js'
import { geocodeGym } from '../utils/geocode.js'

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

export const register = async (req, res) => {
  const { name, email, password, role, gender, weightClass, wins, losses, draws, location, gym, age,
          gymCity, gymPhone, gymWebsite, gymDescription } = req.body
  try {
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already in use' })

    const fighterFields = role === 'fighter' ? {
      gender:      gender      || '',
      weightClass: weightClass || '',
      record: {
        wins:   Number(wins)   || 0,
        losses: Number(losses) || 0,
        draws:  Number(draws)  || 0,
      },
      location: location || '',
      gym:      gym      || '',
      age:      age ? Number(age) : undefined,
    } : {}

    // For coaches: find existing gym by name (case-insensitive) or create a new one
    let gymId = null
    if (role === 'coach' && gym) {
      const escaped = gym.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      let gymDoc = await Gym.findOne({ name: { $regex: new RegExp(`^${escaped}$`, 'i') } })
      if (!gymDoc) {
        const gymData = {
          name:        gym.trim(),
          city:        gymCity        || '',
          phone:       gymPhone       || '',
          website:     gymWebsite     || '',
          description: gymDescription || '',
        }
        const coords = await geocodeGym(gymData)
        gymDoc = await Gym.create({
          ...gymData,
          ...(coords ? { coordinates: coords } : {}),
        })
      }
      gymId = gymDoc._id
    }

    const user = await User.create({ name, email, password, role, gymId, ...fighterFields })

    // Auto-create Fighter document so the user appears on the leaderboard immediately
    if (role === 'fighter') {
      await Fighter.create({
        name: user.name,
        weightClass: user.weightClass || '',
        record: {
          wins:   user.record?.wins   ?? 0,
          losses: user.record?.losses ?? 0,
          draws:  user.record?.draws  ?? 0,
        },
        stats: {
          age: user.age || undefined,
        },
        bio:  '',
        user: user._id,
      })
    }

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMe = async (req, res) => {
  res.json(req.user)
}

export const updateMe = async (req, res) => {
  try {
    const { name, gender, weightClass, wins, losses, draws, location, gym, age, stance } = req.body

    const updates = {}
    if (name        !== undefined) updates.name        = name
    if (gender      !== undefined) updates.gender      = gender
    if (weightClass !== undefined) updates.weightClass = weightClass
    if (location    !== undefined) updates.location    = location
    if (gym         !== undefined) updates.gym         = gym
    if (age         !== undefined) updates.age         = age ? Number(age) : undefined
    if (stance      !== undefined) updates.stance      = stance
    if (wins        !== undefined) updates['record.wins']   = Number(wins)   || 0
    if (losses      !== undefined) updates['record.losses'] = Number(losses) || 0
    if (draws       !== undefined) updates['record.draws']  = Number(draws)  || 0

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    // Keep Fighter document in sync
    if (user.role === 'fighter') {
      const fighterUpdates = {}
      if (name        !== undefined) fighterUpdates.name        = name
      if (weightClass !== undefined) fighterUpdates.weightClass = weightClass
      if (location    !== undefined) fighterUpdates.location    = location
      if (wins        !== undefined) fighterUpdates['record.wins']   = Number(wins)   || 0
      if (losses      !== undefined) fighterUpdates['record.losses'] = Number(losses) || 0
      if (draws       !== undefined) fighterUpdates['record.draws']  = Number(draws)  || 0
      if (stance      !== undefined) fighterUpdates['stats.stance']  = stance
      if (age         !== undefined) fighterUpdates['stats.age']     = age ? Number(age) : undefined

      await Fighter.findOneAndUpdate(
        { user: user._id },
        { $set: fighterUpdates }
      )
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
