import Conversation from '../models/Conversation.js'

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .sort({ lastMessage: -1 })
    res.json(conversations)
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
  const { content } = req.body
  try {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    conversation.messages.push({ sender: req.user._id, content })
    conversation.lastMessage = new Date()
    await conversation.save()

    const newMessage = conversation.messages[conversation.messages.length - 1]
    res.status(201).json(newMessage)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
