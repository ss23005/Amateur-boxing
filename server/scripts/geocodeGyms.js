/**
 * One-time script: geocode all gyms that have null coordinates.
 * Run from the server/ directory: node scripts/geocodeGyms.js
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import Gym from '../models/Gym.js'
import { geocodeGym } from '../utils/geocode.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('Connected to MongoDB')

const gyms = await Gym.find({
  $or: [
    { 'coordinates.lat': null },
    { 'coordinates.lat': { $exists: false } },
  ],
})

console.log(`Found ${gyms.length} gyms with missing coordinates`)

let updated = 0
let failed  = 0

for (const gym of gyms) {
  const coords = await geocodeGym(gym)
  if (coords) {
    gym.coordinates = coords
    await gym.save()
    console.log(`✓ ${gym.name} → ${coords.lat}, ${coords.lng}`)
    updated++
  } else {
    console.log(`✗ ${gym.name} — could not geocode (no address/city data?)`)
    failed++
  }
  // Nominatim rate limit: 1 request/second
  await new Promise(r => setTimeout(r, 1100))
}

console.log(`\nDone. Updated: ${updated}, Failed: ${failed}`)
await mongoose.disconnect()
