import { Router } from 'express'
import multer from 'multer'
import { getPosts, createPost, likePost, addComment, deletePost } from '../controllers/feedController.js'
import protect from '../middleware/authMiddleware.js'

// Memory storage — no disk writes, works on Vercel serverless
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'), false)
    cb(null, true)
  },
})

const router = Router()

router.get('/',              getPosts)
router.post('/',  protect,  upload.single('image'), createPost)
router.put('/:id/like',     protect, likePost)
router.post('/:id/comment', protect, addComment)
router.delete('/:id',       protect, deletePost)

export default router
