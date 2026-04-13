import User from '../models/User.js'
import Fighter from '../models/Fighter.js'
import Post from '../models/Post.js'
import Event from '../models/Event.js'
import News from '../models/News.js'
import FighterChangeRequest from '../models/FighterChangeRequest.js'
import Gym from '../models/Gym.js'
import { geocodeGym } from '../utils/geocode.js'

// ── Analytics ──────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalFighters,
      totalEvents,
      recentUsers,
      recentPosts,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Fighter.countDocuments(),
      Event.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt'),
      Post.find().sort({ createdAt: -1 }).limit(5)
        .populate('author', 'name')
        .select('content media likes comments createdAt'),
    ])

    // Total likes and comments across all posts
    const postAggs = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes:    { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } },
        },
      },
    ])
    const { totalLikes = 0, totalComments = 0 } = postAggs[0] ?? {}

    // Signups per day for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const signupsByDay = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const roleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ])

    res.json({
      totals: { users: totalUsers, posts: totalPosts, fighters: totalFighters, events: totalEvents, likes: totalLikes, comments: totalComments },
      recentUsers,
      recentPosts,
      signupsByDay,
      roleBreakdown,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Fighter Change Requests ────────────────────────────────────────────────
export const getChangeRequests = async (req, res) => {
  try {
    const requests = await FighterChangeRequest.find()
      .sort({ createdAt: -1 })
      .populate('user',    'name email')
      .populate('fighter', 'name weightClass record location')
      .populate('reviewedBy', 'name')
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const reviewChangeRequest = async (req, res) => {
  const { status, reviewNote } = req.body
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'status must be approved or rejected' })
  }
  try {
    const request = await FighterChangeRequest.findById(req.params.id)
      .populate('fighter')
    if (!request) return res.status(404).json({ message: 'Request not found' })

    request.status     = status
    request.reviewNote = reviewNote ?? ''
    request.reviewedBy = req.user._id
    await request.save()

    if (status === 'approved') {
      // Build a flat update object from the stored changes
      const fighterSet = {}
      const userSet    = {}
      for (const [field, { to }] of Object.entries(request.changes)) {
        if (['wins', 'losses', 'draws'].includes(field)) {
          fighterSet[`record.${field}`] = to
          userSet[`record.${field}`]    = to
        } else if (field === 'stance') {
          fighterSet['stats.stance'] = to
          userSet.stance             = to
        } else if (field === 'age') {
          fighterSet['stats.age'] = to
          userSet.age             = to
        } else {
          fighterSet[field] = to
          userSet[field]    = to
        }
      }
      await Promise.all([
        Fighter.findByIdAndUpdate(request.fighter._id, { $set: fighterSet }),
        User.findByIdAndUpdate(request.user,           { $set: userSet   }),
      ])
    }

    res.json(request)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── News ───────────────────────────────────────────────────────────────────
export const getNews = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name')
    res.json(news)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createNews = async (req, res) => {
  try {
    const { title, body, image, published } = req.body
    const article = await News.create({
      title,
      body,
      image:     image     ?? '',
      published: published ?? false,
      author:    req.user._id,
    })
    res.status(201).json(article)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateNews = async (req, res) => {
  try {
    const article = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!article) return res.status(404).json({ message: 'Article not found' })
    res.json(article)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteNews = async (req, res) => {
  try {
    const article = await News.findByIdAndDelete(req.params.id)
    if (!article) return res.status(404).json({ message: 'Article not found' })
    res.json({ message: 'Article deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Events (admin full CRUD) ───────────────────────────────────────────────
export const adminCreateEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, promoter: req.user._id })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const adminUpdateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const adminDeleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json({ message: 'Event deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Users ──────────────────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateUserRole = async (req, res) => {
  const { role } = req.body
  const allowed = ['fan', 'fighter', 'promoter', 'admin', 'superadmin']
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Gyms ───────────────────────────────────────────────────────────────────
export const adminGetGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ city: 1, name: 1 })
    res.json(gyms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const adminCreateGym = async (req, res) => {
  try {
    const coords = await geocodeGym(req.body)
    const gym = await Gym.create({
      ...req.body,
      ...(coords ? { coordinates: coords } : {}),
    })
    res.status(201).json(gym)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const adminUpdateGym = async (req, res) => {
  try {
    const coords = await geocodeGym(req.body)
    const update = {
      ...req.body,
      ...(coords ? { coordinates: coords } : {}),
    }
    const gym = await Gym.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    res.json(gym)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const adminDeleteGym = async (req, res) => {
  try {
    const gym = await Gym.findByIdAndDelete(req.params.id)
    if (!gym) return res.status(404).json({ message: 'Gym not found' })
    res.json({ message: 'Gym deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
