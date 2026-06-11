import { Router } from 'express'
import protect from '../middleware/authMiddleware.js'
import { getSocialData, searchUsers, followUser, unfollowUser, getFollowStatus, deleteMe, getPublicUsers, getUserPublicProfile } from '../controllers/userController.js'

const router = Router()

router.get('/public', getPublicUsers)
router.delete('/me', protect, deleteMe)
router.get('/me/social', protect, getSocialData)
router.get('/search', protect, searchUsers)
router.get('/:id/follow-status', protect, getFollowStatus)
router.get('/:id/profile', getUserPublicProfile)
router.post('/:id/follow', protect, followUser)
router.post('/:id/unfollow', protect, unfollowUser)

export default router
