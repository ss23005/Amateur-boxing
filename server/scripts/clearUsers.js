import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Fighter from '../models/Fighter.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('Connected to MongoDB')

const users   = await User.deleteMany({})
const fighters = await Fighter.deleteMany({})

console.log(`Deleted ${users.deletedCount} users`)
console.log(`Deleted ${fighters.deletedCount} fighter documents`)

await mongoose.disconnect()
console.log('Done.')
