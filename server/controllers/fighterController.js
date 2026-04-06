import Fighter from '../models/Fighter.js'

export const getFighters = async (req, res) => {
  try {
    const fighters = await Fighter.find().populate('user', 'name avatar')
    res.json(fighters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getFighterById = async (req, res) => {
  try {
    const fighter = await Fighter.findById(req.params.id).populate('user', 'name avatar')
    if (!fighter) return res.status(404).json({ message: 'Fighter not found' })
    res.json(fighter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createFighter = async (req, res) => {
  try {
    const fighter = await Fighter.create({ ...req.body, user: req.user._id })
    res.status(201).json(fighter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateFighter = async (req, res) => {
  try {
    const fighter = await Fighter.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!fighter) return res.status(404).json({ message: 'Fighter not found' })
    res.json(fighter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteFighter = async (req, res) => {
  try {
    const fighter = await Fighter.findByIdAndDelete(req.params.id)
    if (!fighter) return res.status(404).json({ message: 'Fighter not found' })
    res.json({ message: 'Fighter deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
