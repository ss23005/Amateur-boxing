import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' })
  }
}

// Attach user if token present, but don't block unauthenticated requests
export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return next()
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
  } catch {}
  next()
}

// Block fighters/coaches that haven't been approved yet
export const requireApproved = (req, res, next) => {
  const s = req.user?.status
  if (s === 'pending' || s === 'denied') {
    return res.status(403).json({
      message: 'Your account is pending approval',
      code: 'PENDING_APPROVAL',
    })
  }
  next()
}

export default protect
