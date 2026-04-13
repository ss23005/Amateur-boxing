import mongoose from 'mongoose'

const newsSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    body:        { type: String, required: true },
    author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image:       { type: String, default: '' },
    published:   { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
)

newsSchema.pre('save', function (next) {
  if (this.published && !this.publishedAt) this.publishedAt = new Date()
  next()
})

export default mongoose.model('News', newsSchema)
