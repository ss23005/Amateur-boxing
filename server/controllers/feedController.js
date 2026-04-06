import Post from '../models/Post.js'

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id })
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

    const alreadyLiked = post.likes.includes(req.user._id)
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString())
    } else {
      post.likes.push(req.user._id)
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
