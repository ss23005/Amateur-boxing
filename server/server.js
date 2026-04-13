import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'

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

dotenv.config()
connectDB()

const app = express()
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
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

// Socket.io
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
  })

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
