import User from '../models/User.js'
import Fighter from '../models/Fighter.js'
import Post from '../models/Post.js'
import Event from '../models/Event.js'
import News from '../models/News.js'
import FighterChangeRequest from '../models/FighterChangeRequest.js'
import Gym from '../models/Gym.js'
import { geocodeGym } from '../utils/geocode.js'
import { generateGymSlug } from '../utils/slug.js'
import {
  sendApprovalEmail,
  sendDenialEmail,
  sendGymApprovalEmail,
  sendGymDenialEmail,
} from '../utils/email.js'

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
    const { title, body, image, published } = req.body
    const update = {}
    if (title     !== undefined) update.title     = title
    if (body      !== undefined) update.body      = body
    if (image     !== undefined) update.image     = image
    if (published !== undefined) update.published = published

    const article = await News.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
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
    const { title, date, venue, description, poster, status, bouts } = req.body
    const event = await Event.create({ title, date, venue, description, poster, status, bouts, promoter: req.user._id })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const adminUpdateEvent = async (req, res) => {
  try {
    const { title, date, venue, description, poster, status, bouts } = req.body
    const update = {}
    if (title       !== undefined) update.title       = title
    if (date        !== undefined) update.date        = date
    if (venue       !== undefined) update.venue       = venue
    if (description !== undefined) update.description = description
    if (poster      !== undefined) update.poster      = poster
    if (status      !== undefined) update.status      = status
    if (bouts       !== undefined) update.bouts       = bouts

    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true })
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
    const { name, address, city, country, phone, website, email, description } = req.body
    const gymData = { name, address, city, country, phone, website, email, description }
    const coords = await geocodeGym(gymData)
    const slug = await generateGymSlug(name)
    const gym = await Gym.create({
      ...gymData,
      slug,
      ...(coords ? { coordinates: coords } : {}),
    })
    res.status(201).json(gym)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const adminUpdateGym = async (req, res) => {
  try {
    const { name, address, city, country, phone, website, email, description } = req.body
    const gymData = {}
    if (name        !== undefined) gymData.name        = name
    if (address     !== undefined) gymData.address     = address
    if (city        !== undefined) gymData.city        = city
    if (country     !== undefined) gymData.country     = country
    if (phone       !== undefined) gymData.phone       = phone
    if (website     !== undefined) gymData.website     = website
    if (email       !== undefined) gymData.email       = email
    if (description !== undefined) gymData.description = description

    const coords = await geocodeGym(gymData)
    const update = { ...gymData, ...(coords ? { coordinates: coords } : {}) }
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

// ── Pending approvals ──────────────────────────────────────────────────────
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: { $in: ['pending', 'denied'] },
      role:   { $in: ['fighter', 'gym'] },
    })
      .sort({ createdAt: -1 })
      .select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.role === 'fighter') {
      await Fighter.findOneAndUpdate({ user: user._id }, { $set: { status: 'approved' } })
    }

    sendApprovalEmail(user).catch(() => {})
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const denyUser = async (req, res) => {
  try {
    const { message, weightClass, location, age } = req.body
    const updates = { status: 'denied' }
    if (weightClass !== undefined) updates.weightClass = weightClass
    if (location    !== undefined) updates.location    = location
    if (age         !== undefined) updates.age         = age ? Number(age) : undefined

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.role === 'fighter') {
      const fighterUpdates = {}
      if (weightClass !== undefined) fighterUpdates.weightClass     = weightClass
      if (location    !== undefined) fighterUpdates.location        = location
      if (age         !== undefined) fighterUpdates['stats.age']    = age ? Number(age) : undefined
      await Fighter.findOneAndUpdate({ user: user._id }, { $set: fighterUpdates })
    }

    sendDenialEmail(user, message ?? '').catch(() => {})
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getPendingGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
    res.json(gyms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const approveGym = async (req, res) => {
  try {
    const gym = await Gym.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved' } },
      { new: true }
    ).populate('createdBy', 'name email')
    if (!gym) return res.status(404).json({ message: 'Gym not found' })

    if (gym.createdBy) sendGymApprovalEmail(gym.createdBy, gym).catch(() => {})
    res.json(gym)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const denyGym = async (req, res) => {
  try {
    const { message } = req.body
    const gym = await Gym.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'denied' } },
      { new: true }
    ).populate('createdBy', 'name email')
    if (!gym) return res.status(404).json({ message: 'Gym not found' })

    if (gym.createdBy) sendGymDenialEmail(gym.createdBy, gym, message ?? '').catch(() => {})
    res.json(gym)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllJoinRequests = async (req, res) => {
  try {
    const requests = await User.find({ gymJoinStatus: 'pending', role: 'fighter' })
      .select('name username avatar record weightClass location gymId gymJoinStatus createdAt')
      .populate('gymId', 'name city slug')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const adminApproveJoinRequest = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { gymJoinStatus: 'approved' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const adminRejectJoinRequest = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { gymId: null, gymJoinStatus: 'rejected' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
