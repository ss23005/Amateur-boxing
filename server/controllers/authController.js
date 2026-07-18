import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Fighter from '../models/Fighter.js'
import Gym from '../models/Gym.js'
import { geocodeGym } from '../utils/geocode.js'
import { sendVerificationEmail, sendSystemVerificationEmail, sendAdminNewGymEmail, sendJoinRequestEmail, sendPasswordResetEmail } from '../utils/email.js'
import { uploadImage } from '../utils/cloudinary.js'
import { generateGymSlug } from '../utils/slug.js'

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

export const register = async (req, res) => {
  const {
    name, username, email, password, role, gender, weightClass, wins, losses, draws,
    location, gym, age,
    gymAddress, gymCity, gymPostcode, gymCountry, gymPhone, gymWebsite, gymDescription,
    selectedGymId, gymBrandColor, gymLogo, gymGallery,
    source,
  } = req.body
  try {
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already in use' })
    if (username) {
      const usernameTaken = await User.findOne({ username: username.toLowerCase().trim() })
      if (usernameTaken) return res.status(400).json({ message: 'Username already taken' })
    }

    const fighterFields = role === 'fighter' ? {
      gender:      gender      || '',
      weightClass: weightClass || '',
      record: {
        wins:   Number(wins)   || 0,
        losses: Number(losses) || 0,
        draws:  Number(draws)  || 0,
      },
      location: location || '',
      gym:      gym      || '',
      age:      age ? Number(age) : undefined,
    } : {}

    let gymId    = null
    let newGymId = null

    // Fighters selecting a gym create a pending join request
    if (role === 'fighter' && selectedGymId) {
      gymId = selectedGymId
    }

    // Gym accounts: join an existing gym by ID, or create a new one
    if (role === 'gym') {
      if (selectedGymId) {
        // Coach joining an already-approved gym
        gymId = selectedGymId
      } else if (gym) {
        // Coach creating a new gym
        const gymData = {
          name:        gym.trim(),
          address:     gymAddress     || '',
          city:        gymCity        || '',
          postcode:    gymPostcode    || '',
          country:     gymCountry     || '',
          phone:       gymPhone       || '',
          website:     gymWebsite     || '',
          description: gymDescription || '',
          brandColor:  gymBrandColor  || '',
        }
        const coords = await geocodeGym(gymData)

        let logoUrl = ''
        if (gymLogo) {
          const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                                process.env.CLOUDINARY_API_KEY    &&
                                process.env.CLOUDINARY_API_SECRET
          if (hasCloudinary) {
            try {
              const base64Data = gymLogo.replace(/^data:image\/\w+;base64,/, '')
              const buffer = Buffer.from(base64Data, 'base64')
              logoUrl = await uploadImage(buffer, 'gym-logos')
            } catch (uploadErr) {
              console.error('Cloudinary upload failed, storing base64 directly:', uploadErr.message)
              logoUrl = gymLogo
            }
          } else {
            // No Cloudinary configured — store base64 data URL directly in MongoDB
            logoUrl = gymLogo
          }
        }

        // Upload gallery images
        let galleryUrls = []
        if (Array.isArray(gymGallery) && gymGallery.length > 0) {
          const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                                process.env.CLOUDINARY_API_KEY    &&
                                process.env.CLOUDINARY_API_SECRET
          for (const imgData of gymGallery.slice(0, 6)) {
            try {
              if (hasCloudinary) {
                const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '')
                const buffer = Buffer.from(base64Data, 'base64')
                galleryUrls.push(await uploadImage(buffer, 'gym-gallery'))
              } else {
                galleryUrls.push(imgData)
              }
            } catch { /* skip failed uploads */ }
          }
        }

        const slug = await generateGymSlug(gymData.name)
        const gymDoc = await Gym.create({
          ...gymData,
          slug,
          logo:    logoUrl,
          gallery: galleryUrls,
          status:  'approved',
          ...(coords ? { coordinates: coords } : {}),
        })
        newGymId = gymDoc._id
        gymId    = gymDoc._id
      }
    }

    const verificationToken   = crypto.randomInt(100000, 1000000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000)

    const userStatus = 'approved'

    const user = await User.create({
      name,
      username: username?.toLowerCase().trim(),
      email,
      password,
      role,
      gymId,
      gymJoinStatus: (role === 'fighter' && selectedGymId) ? 'pending' : '',
      status: userStatus,
      emailVerificationToken:   verificationToken,
      emailVerificationExpires: verificationExpires,
      ...fighterFields,
    })

    // Notify gym owner when a fighter signs up with a pending join request
    if (role === 'fighter' && selectedGymId) {
      const gymOwner = await User.findOne({ gymId: selectedGymId, role: 'gym' })
      const gymDoc   = await Gym.findById(selectedGymId)
      if (gymOwner && gymDoc) sendJoinRequestEmail(gymOwner, user, gymDoc).catch(() => {})
    }

    // Now that we have user._id, link the newly created gym to this owner
    if (newGymId) {
      await Gym.findByIdAndUpdate(newGymId, { createdBy: user._id })
      // Notify admin of new gym sign-up
      const gymDoc = await Gym.findById(newGymId)
      if (gymDoc) sendAdminNewGymEmail(gymDoc, user).catch(() => {})
    }

    if (role === 'fighter') {
      await Fighter.create({
        name:       user.username || user.name,
        weightClass: user.weightClass || '',
        record: {
          wins:   user.record?.wins   ?? 0,
          losses: user.record?.losses ?? 0,
          draws:  user.record?.draws  ?? 0,
        },
        stats: { age: user.age || undefined },
        bio:    '',
        user:   user._id,
        status: 'approved',
      })
    }

    // Route email template based on where the user signed up from
    const sendEmail = source === 'presignup' ? sendVerificationEmail : sendSystemVerificationEmail
    sendEmail(user, verificationToken)
      .then(() => console.log(`✓ Verification email sent to ${user.email}`))
      .catch(err => {
        console.error('Verification email failed:', err.message)
        if (err.response) console.error('SendGrid response:', JSON.stringify(err.response.body))
      })

    res.status(201).json({
      _id:           user._id,
      name:          user.name,
      username:      user.username,
      email:         user.email,
      role:          user.role,
      status:        user.status,
      emailVerified: user.emailVerified,
      token:         generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query
    if (!username) return res.status(400).json({ message: 'Username required' })
    const exists = await User.findOne({ username: username.toLowerCase().trim() })
    res.json({ available: !exists })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query
    if (!email) return res.status(400).json({ message: 'Email required' })
    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    res.json({ available: !exists })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const identifier = email?.trim().toLowerCase()
    const isEmail = identifier?.includes('@')
    const user = await User.findOne(
      isEmail ? { email: identifier } : { username: identifier }
    )
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    res.json({
      _id:      user._id,
      name:     user.name,
      username: user.username,
      email:    user.email,
      role:     user.role,
      status:   user.status,
      token:    generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMe = async (req, res) => {
  res.json(req.user)
}

export const verifyEmail = async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ message: 'Code required' })
  try {
    const user = await User.findOne({
      _id:                      req.user._id,
      emailVerificationToken:   code.trim(),
      emailVerificationExpires: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ message: 'Incorrect code or it has expired' })

    user.emailVerified            = true
    user.emailVerificationToken   = null
    user.emailVerificationExpires = null
    await user.save()

    res.json({ message: 'Email verified successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' })

    const token   = crypto.randomInt(100000, 1000000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    user.emailVerificationToken   = token
    user.emailVerificationExpires = expires
    await user.save()

    await sendSystemVerificationEmail(user, token)
    res.json({ message: 'Verification email sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateMe = async (req, res) => {
  try {
    const { name, gender, weightClass, wins, losses, draws, location, gym, age, stance } = req.body

    const updates = {}
    if (name        !== undefined) updates.name        = name
    if (gender      !== undefined) updates.gender      = gender
    if (weightClass !== undefined) updates.weightClass = weightClass
    if (location    !== undefined) updates.location    = location
    if (gym         !== undefined) updates.gym         = gym
    if (age         !== undefined) updates.age         = age ? Number(age) : undefined
    if (stance      !== undefined) updates.stance      = stance
    if (wins        !== undefined) updates['record.wins']   = Number(wins)   || 0
    if (losses      !== undefined) updates['record.losses'] = Number(losses) || 0
    if (draws       !== undefined) updates['record.draws']  = Number(draws)  || 0

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    if (user.role === 'fighter') {
      const fighterUpdates = {}
      if (name        !== undefined) fighterUpdates.name              = name
      if (weightClass !== undefined) fighterUpdates.weightClass       = weightClass
      if (location    !== undefined) fighterUpdates.location          = location
      if (wins        !== undefined) fighterUpdates['record.wins']    = Number(wins)   || 0
      if (losses      !== undefined) fighterUpdates['record.losses']  = Number(losses) || 0
      if (draws       !== undefined) fighterUpdates['record.draws']   = Number(draws)  || 0
      if (stance      !== undefined) fighterUpdates['stats.stance']   = stance
      if (age         !== undefined) fighterUpdates['stats.age']      = age ? Number(age) : undefined

      await Fighter.findOneAndUpdate(
        { user: user._id },
        { $set: fighterUpdates }
      )
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const changeEmail = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email required' })
  try {
    const user = await User.findById(req.user._id)
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' })

    const taken = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } })
    if (taken) return res.status(400).json({ message: 'Email already in use' })

    const token   = crypto.randomInt(100000, 1000000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    user.email                     = email.toLowerCase().trim()
    user.emailVerificationToken    = token
    user.emailVerificationExpires  = expires
    await user.save()

    await sendSystemVerificationEmail(user, token)
    res.json({ message: 'Email updated — verification code sent', email: user.email })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email required' })
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Always return success to avoid email enumeration
    if (!user) return res.json({ message: 'If that email is registered you will receive a reset link shortly' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashed     = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.passwordResetToken   = hashed
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    const clientUrl  = process.env.CLIENT_URL ?? 'http://localhost:5173'
    const resetUrl   = `${clientUrl}/reset-password/${resetToken}`
    await sendPasswordResetEmail(user, resetUrl)

    res.json({ message: 'If that email is registered you will receive a reset link shortly' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
  try {
    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const user   = await User.findOne({
      passwordResetToken:   hashed,
      passwordResetExpires: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' })

    user.password             = password
    user.passwordResetToken   = null
    user.passwordResetExpires = null
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
