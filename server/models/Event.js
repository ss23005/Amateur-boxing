import mongoose from 'mongoose'

const boutSchema = new mongoose.Schema({
  fighter1: { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter' },
  fighter2: { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter' },
  weightClass: String,
  rounds: { type: Number, default: 10 },
  result: {
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter' },
    method: String,
    round: Number,
    time: String,
  },
})

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    venue: {
      name: String,
      city: String,
      state: String,
      country: String,
    },
    promoter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bouts: [boutSchema],
    description: { type: String, default: '' },
    poster: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: true }
)

export default mongoose.model('Event', eventSchema)
