import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Fighter from '../models/Fighter.js'
import Gym from '../models/Gym.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('Connected to MongoDB')

const users   = await User.updateMany({ status: 'pending' }, { $set: { status: 'approved' } })
const fighters = await Fighter.updateMany({ status: 'pending' }, { $set: { status: 'approved' } })
const gyms    = await Gym.updateMany({ status: 'pending' }, { $set: { status: 'approved' } })

console.log(`Approved ${users.modifiedCount} users`)
console.log(`Approved ${fighters.modifiedCount} fighter documents`)
console.log(`Approved ${gyms.modifiedCount} gyms`)

await mongoose.disconnect()
console.log('Done.')
