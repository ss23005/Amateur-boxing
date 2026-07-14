import Gym from '../models/Gym.js'

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export async function generateGymSlug(name) {
  const base = toSlug(name)
  let slug = base
  let n = 1
  while (await Gym.findOne({ slug })) {
    slug = `${base}-${n++}`
  }
  return slug
}
