import { Router } from 'express'
import {
  getConversations,
  getConversation,
  getOrCreateConversation,
  sendMessage,
} from '../controllers/messageController.js'
import protect, { requireApproved } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/',                     protect, getConversations)
router.get('/with/:recipientId',    protect, requireApproved, getOrCreateConversation)
router.get('/:conversationId',      protect, getConversation)
router.post('/:conversationId',     protect, requireApproved, sendMessage)

export default router
