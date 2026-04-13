import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .limit(30)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
