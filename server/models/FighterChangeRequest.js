import mongoose from 'mongoose'

const fighterChangeRequestSchema = new mongoose.Schema(
  {
    fighter: { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    changes: { type: mongoose.Schema.Types.Mixed, required: true }, // { field: { from, to } }
    status:  { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('FighterChangeRequest', fighterChangeRequestSchema)
