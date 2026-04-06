import mongoose from 'mongoose'

const fighterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    weightClass: { type: String, required: true },
    record: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      noContests: { type: Number, default: 0 },
    },
    stats: {
      height: String,
      reach: String,
      stance: { type: String, enum: ['orthodox', 'southpaw', 'switch'], default: 'orthodox' },
      age: Number,
      nationality: String,
    },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default mongoose.model('Fighter', fighterSchema)
