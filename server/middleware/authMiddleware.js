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

// Reads token if present but never blocks unauthenticated requests.
// Sets req.user if valid token is provided — used for public routes that
// need optional identity (e.g. gym directory showing pending gyms to their creator).
export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next()
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
  } catch {
    // Invalid token — just proceed without user identity
  }
  next()
}

// Blocks users who haven't verified their email or who are pending/denied.
// Admins and superadmins bypass all checks.
export const requireApproved = (req, res, next) => {
  const { emailVerified, status, role } = req.user || {}
  if (role === 'superadmin' || role === 'admin') return next()
  if (!emailVerified) {
    return res.status(403).json({ message: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' })
  }
  if (status === 'pending' || status === 'denied') {
    return res.status(403).json({ message: 'Your account is pending approval', code: 'PENDING_APPROVAL' })
  }
  next()
}

export default protect
