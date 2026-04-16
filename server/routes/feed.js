import { Router } from 'express'
import { getPosts, createPost, likePost, addComment, deletePost } from '../controllers/feedController.js'
import protect from '../middleware/authMiddleware.js'

const router = Router()

router.get('/',              getPosts)
router.post('/',  protect,  createPost)
router.put('/:id/like',     protect, likePost)
router.post('/:id/comment', protect, addComment)
router.delete('/:id',       protect, deletePost)

export default router
