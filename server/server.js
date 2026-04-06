import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

import authRoutes from './routes/auth.js'
import fighterRoutes from './routes/fighters.js'
import eventRoutes from './routes/events.js'
import feedRoutes from './routes/feed.js'
import messageRoutes from './routes/messages.js'

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

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/fighters', fighterRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/messages', messageRoutes)

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
