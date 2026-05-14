import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['fan', 'fighter', 'coach', 'admin', 'superadmin'], default: 'fan' },
    avatar: { type: String, default: '' },
    // Fighter profile fields
    gender:      { type: String, enum: ['male', 'female', ''], default: '' },
    weightClass: { type: String, default: '' },
    record: {
      wins:   { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws:  { type: Number, default: 0 },
    },
    location: { type: String, default: '' },
    gym:      { type: String, default: '' },
    age:      { type: Number },
    stance:   { type: String, enum: ['orthodox', 'southpaw', 'switch', ''], default: '' },
    gymId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)
