import { Router } from 'express'
import { getPosts, createPost, likePost, addComment, deletePost } from '../controllers/feedController.js'
import protect, { requireApproved } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/',              getPosts)
router.post('/',             protect, requireApproved, createPost)
router.put('/:id/like',     protect, requireApproved, likePost)
router.post('/:id/comment', protect, requireApproved, addComment)
router.delete('/:id',       protect, deletePost)

export default router
