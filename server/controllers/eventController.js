import Event from '../models/Event.js'

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('promoter', 'name')
    res.json(events)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('promoter', 'name')
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, promoter: req.user._id })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json({ message: 'Event deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
