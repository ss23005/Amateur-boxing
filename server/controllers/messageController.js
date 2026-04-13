import Conversation from '../models/Conversation.js'

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .sort({ lastMessage: -1 })

    // Attach last message preview and fix participants
    const result = conversations.map(c => {
      const obj = c.toObject()
      const lastMsg = obj.messages[obj.messages.length - 1]
      obj.lastMessagePreview = lastMsg?.content ?? ''
      obj.lastMessageAt = lastMsg?.createdAt ?? obj.lastMessage
      obj.messages = [] // don't send full messages in inbox
      return obj
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getConversation = async (req, res) => {
  const { conversationId } = req.params
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    }).populate('participants', 'name avatar')

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    // Populate sender info and shared posts in messages
    await conversation.populate('messages.sender', 'name avatar')
    await conversation.populate('messages.post', 'content media author')

    res.json(conversation)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getOrCreateConversation = async (req, res) => {
  const { recipientId } = req.params
  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    }).populate('participants', 'name avatar')

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
      })
      await conversation.populate('participants', 'name avatar')
    }
    res.json(conversation)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const sendMessage = async (req, res) => {
  const { conversationId } = req.params
  const { content, postId } = req.body
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    })
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    if (!content?.trim() && !postId) {
      return res.status(400).json({ message: 'Message content or post required' })
    }
    const msgData = { sender: req.user._id, content: content ?? '' }
    if (postId) msgData.post = postId

    conversation.messages.push(msgData)
    conversation.lastMessage = new Date()
    await conversation.save()

    const newMessage = conversation.messages[conversation.messages.length - 1]
    await conversation.populate('messages.sender', 'name avatar')
    await conversation.populate('messages.post', 'content media author')
    const populated = conversation.messages.id(newMessage._id)

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
