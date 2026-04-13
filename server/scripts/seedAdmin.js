import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import User from '../models/User.js'

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)

  const existing = await User.findOne({ email: 'reece@abw.com' })
  if (existing) {
    if (existing.role !== 'superadmin') {
      existing.role = 'superadmin'
      await existing.save()
      console.log('Updated existing account to superadmin.')
    } else {
      console.log('Superadmin already exists — nothing to do.')
    }
    process.exit(0)
  }

  await User.create({
    name:     'Reece',
    email:    'reece@abw.com',
    password: 'ABW2025',
    role:     'superadmin',
  })

  console.log('✓ Superadmin created')
  console.log('  Email:    reece@abw.com')
  console.log('  Password: ABW2025')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
