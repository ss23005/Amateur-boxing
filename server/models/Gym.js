import mongoose from 'mongoose'

const gymSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    address:     { type: String, default: '' },
    city:        { type: String, default: '', trim: true },
    country:     { type: String, default: '' },
    phone:       { type: String, default: '' },
    website:     { type: String, default: '' },
    email:       { type: String, default: '' },
    description: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    status:    { type: String, enum: ['pending', 'approved', 'denied'], default: 'approved' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Gym', gymSchema)
