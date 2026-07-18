import Fighter from '../models/Fighter.js'

export const getFighters = async (req, res) => {
  try {
    const { search, weightClass, stance, nationality, sort } = req.query
    const query = {}

    if (search)      query.name = { $regex: search, $options: 'i' }
    if (weightClass) query.weightClass = weightClass
    if (stance)      query['stats.stance'] = stance
    if (nationality) query['stats.nationality'] = { $regex: nationality, $options: 'i' }

    let dbQuery = Fighter.find(query).populate('user', 'name username avatar location')

    if (sort === 'wins')    dbQuery = dbQuery.sort({ 'record.wins': -1 })
    else if (sort === 'newest') dbQuery = dbQuery.sort({ createdAt: -1 })
    else                    dbQuery = dbQuery.sort({ name: 1 })

    const fighters = await dbQuery
    res.json(fighters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getFighterById = async (req, res) => {
  try {
    const fighter = await Fighter.findById(req.params.id).populate('user', 'name username avatar')
    if (!fighter) return res.status(404).json({ message: 'Fighter not found' })
    res.json(fighter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyFighterProfile = async (req, res) => {
  try {
    const fighter = await Fighter.findOne({ user: req.user._id })
    if (!fighter) return res.status(404).json({ message: 'No fighter profile found' })
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

// Ensures a fighter-role user has a matching Fighter document.
// Safe to call multiple times. Tries to link an existing unlinked fighter by
// name before creating a new one, so admin-seeded fighters get connected.
export const syncMyFighterProfile = async (req, res) => {
  try {
    const user = req.user
    if (user.role !== 'fighter') {
      return res.status(400).json({ message: 'Only fighter accounts can sync a profile.' })
    }

    // 1. Already linked to this user?
    let fighter = await Fighter.findOne({ user: user._id })

    // 2. Find an unlinked fighter matching by display name, then username
    if (!fighter) {
      const tryLink = async (name) => {
        if (!name) return null
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return Fighter.findOneAndUpdate(
          { user: null, name: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { $set: { user: user._id } },
          { new: true }
        )
      }
      fighter = (await tryLink(user.name)) || (await tryLink(user.username))
    }

    // 3. Nothing found — create a fresh fighter document
    if (!fighter) {
      fighter = await Fighter.create({
        name:        user.username || user.name,
        weightClass: user.weightClass || '',
        record: {
          wins:   user.record?.wins   ?? 0,
          losses: user.record?.losses ?? 0,
          draws:  user.record?.draws  ?? 0,
        },
        stats:    { age: user.age || undefined },
        location: user.location || '',
        bio:      '',
        user:     user._id,
        status:   'approved',
      })
    }

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
