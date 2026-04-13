import User from '../models/User.js'
import Notification from '../models/Notification.js'
import Fighter from '../models/Fighter.js'

export const getSocialData = async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .populate('following', 'name avatar role')
      .populate('followers', 'name avatar role')
      .select('following followers')
    res.json({ following: me.following, followers: me.followers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const searchUsers = async (req, res) => {
  const { q } = req.query
  if (!q || q.trim().length < 2) return res.json([])
  try {
    const users = await User.find({
      name: { $regex: q.trim(), $options: 'i' },
      _id: { $ne: req.user._id },
    })
      .select('name avatar role')
      .limit(20)
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const followUser = async (req, res) => {
  const { id } = req.params
  if (id === String(req.user._id)) return res.status(400).json({ message: 'Cannot follow yourself' })
  try {
    const [me, target] = await Promise.all([
      User.findById(req.user._id),
      User.findById(id),
    ])
    if (!target) return res.status(404).json({ message: 'User not found' })

    const alreadyFollowing = me.following.some(f => String(f) === id)
    if (alreadyFollowing) return res.json({ following: true })

    me.following.push(id)
    target.followers.push(req.user._id)
    await Promise.all([me.save(), target.save()])

    // Notify the followed user (fire-and-forget)
    Notification.create({ recipient: id, sender: req.user._id, type: 'follow' }).catch(() => {})

    res.json({ following: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const unfollowUser = async (req, res) => {
  const { id } = req.params
  try {
    const [me, target] = await Promise.all([
      User.findById(req.user._id),
      User.findById(id),
    ])
    if (!target) return res.status(404).json({ message: 'User not found' })

    me.following = me.following.filter(f => String(f) !== id)
    target.followers = target.followers.filter(f => String(f) !== String(req.user._id))
    await Promise.all([me.save(), target.save()])

    res.json({ following: false })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteMe = async (req, res) => {
  try {
    const id = req.user._id
    // Remove from all other users' following/followers lists
    await User.updateMany({ following: id }, { $pull: { following: id } })
    await User.updateMany({ followers: id }, { $pull: { followers: id } })
    // Delete associated fighter doc if any
    await Fighter.deleteOne({ user: id })
    // Delete notifications involving this user
    await Notification.deleteMany({ $or: [{ recipient: id }, { sender: id }] })
    // Delete the user
    await User.findByIdAndDelete(id)
    res.json({ message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getFollowStatus = async (req, res) => {
  const { id } = req.params
  try {
    const me = await User.findById(req.user._id).select('following')
    const following = me.following.some(f => String(f) === id)
    res.json({ following })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
