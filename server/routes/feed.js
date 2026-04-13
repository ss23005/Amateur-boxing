import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getPosts, createPost, likePost, addComment, deletePost } from '../controllers/feedController.js'
import protect from '../middleware/authMiddleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'), false)
    cb(null, true)
  },
})

const router = Router()

router.get('/',             getPosts)
router.post('/',  protect,  upload.single('image'), createPost)
router.put('/:id/like',    protect, likePost)
router.post('/:id/comment', protect, addComment)
router.delete('/:id',      protect, deletePost)

export default router
