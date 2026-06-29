import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import Conversation from './models/Conversation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import authRoutes from './routes/auth.js'
import fighterRoutes from './routes/fighters.js'
import eventRoutes from './routes/events.js'
import feedRoutes from './routes/feed.js'
import messageRoutes from './routes/messages.js'
import adminRoutes from './routes/admin.js'
import gymRoutes from './routes/gyms.js'
import userRoutes from './routes/users.js'
import notificationRoutes from './routes/notifications.js'

connectDB()

const app = express()
const httpServer = http.createServer(app)

// Lock CORS to known origins — prevents cross-origin requests from arbitrary sites
const allowedOrigins = [
  process.env.CLIENT_URL ?? 'https://boxingamateur.com',
  'http://localhost:5173',
]

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
})

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/fighters', fighterRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/gyms', gymRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)

// Socket.io — require valid JWT on connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Authentication required'))
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = String(decoded.id)
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`)

  // Only allow joining a room if the user is a participant of that conversation
  socket.on('join_room', async (roomId) => {
    try {
      const conv = await Conversation.findOne({
        _id: roomId,
        participants: socket.userId,
      }).select('_id')
      if (!conv) return
      socket.join(roomId)
    } catch {
      // Invalid roomId format or DB error — silently ignore
    }
  })

  // Only relay if the sender has already joined the room (join_room validates membership)
  socket.on('send_message', (data) => {
    if (!socket.rooms.has(data.roomId)) return
    socket.to(data.roomId).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// Export app for Vercel serverless
export default app

// Only bind a port when running directly (local dev / Railway)
const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  const PORT = process.env.PORT || 5001
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
