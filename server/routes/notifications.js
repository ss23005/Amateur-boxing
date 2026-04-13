import { Router } from 'express'
import protect from '../middleware/authMiddleware.js'
import { getNotifications, markAllRead } from '../controllers/notificationController.js'

const router = Router()

router.get('/',          protect, getNotifications)
router.put('/read-all',  protect, markAllRead)

export default router
