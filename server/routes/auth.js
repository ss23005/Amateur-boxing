import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, getMe, updateMe, checkEmail, checkUsername, verifyEmail, resendVerification } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'

// Strict: login + register — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
})

// Moderate: email/username availability checks — 30 per minute per IP
const checkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down' },
})

// Resend verification — 5 per hour
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many resend attempts, please try again later' },
})

const router = Router()

router.post('/register',            authLimiter,   register)
router.post('/login',               authLimiter,   login)
router.get('/check-email',          checkLimiter,  checkEmail)
router.get('/check-username',       checkLimiter,  checkUsername)
router.get('/me',                   protect,       getMe)
router.put('/me',                   protect,       updateMe)
router.post('/verify-email',        protect,       verifyEmail)
router.post('/resend-verification', protect, resendLimiter, resendVerification)

export default router
