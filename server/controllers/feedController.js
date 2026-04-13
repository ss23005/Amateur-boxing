import Post from '../models/Post.js'
import Notification from '../models/Notification.js'
import { uploadImage } from '../utils/cloudinary.js'

export const getPosts = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(20, parseInt(req.query.limit) || 8)
    const skip  = (page - 1) * limit

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar'),
      Post.countDocuments(),
    ])

    res.json({
      posts,
      page,
      hasMore: skip + posts.length < total,
      total,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createPost = async (req, res) => {
  try {
    let media = []
    if (req.file) {
      const url = await uploadImage(req.file.buffer, 'abw-posts')
      media = [url]
    }
    const post = await Post.create({
      content: req.body.content ?? '',
      author:  req.user._id,
      media,
    })
    await post.populate('author', 'name avatar')
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const alreadyLiked = post.likes.some(id => id.toString() === req.user._id.toString())
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      post.likes.push(req.user._id)
      // Notify post author (not self)
      if (post.author.toString() !== req.user._id.toString()) {
        Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id }).catch(() => {})
      }
    }
    await post.save()
    res.json({ likes: post.likes.length, liked: !alreadyLiked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments.push({ author: req.user._id, content: req.body.content })
    await post.save()
    await post.populate('comments.author', 'name avatar')

    // Notify post author (not self)
    if (post.author.toString() !== req.user._id.toString()) {
      Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id }).catch(() => {})
    }

    res.status(201).json(post.comments[post.comments.length - 1])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    await post.deleteOne()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
