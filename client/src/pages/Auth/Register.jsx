import { useState, useContext, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { TutorialContext } from '../../context/TutorialContext'
import api from '../../services/api'
import logo from '../../assets/logo.svg'

const MENS_WEIGHT_CLASSES = [
  { value: 'Minimumweight',     label: 'Minimumweight (Up to 49 kg / 108 lbs)' },
  { value: 'Flyweight',         label: 'Flyweight (Up to 52 kg / 115 lbs)' },
  { value: 'Bantamweight',      label: 'Bantamweight (Up to 56 kg / 123 lbs)' },
  { value: 'Lightweight',       label: 'Lightweight (Up to 60 kg / 132 lbs)' },
  { value: 'Light Welterweight', label: 'Light Welterweight (Up to 64 kg / 141 lbs)' },
  { value: 'Welterweight',      label: 'Welterweight (Up to 69 kg / 152 lbs)' },
  { value: 'Middleweight',      label: 'Middleweight (Up to 75 kg / 165 lbs)' },
  { value: 'Light Heavyweight', label: 'Light Heavyweight (Up to 81 kg / 178 lbs)' },
  { value: 'Heavyweight',       label: 'Heavyweight (Up to 91 kg / 201 lbs)' },
  { value: 'Super Heavyweight', label: 'Super Heavyweight (Over 91 kg / 201 lbs)' },
]

const WOMENS_WEIGHT_CLASSES = [
  { value: 'Flyweight',          label: 'Flyweight (48–51 kg)' },
  { value: 'Bantamweight',       label: 'Bantamweight (51–54 kg)' },
  { value: 'Featherweight',      label: 'Featherweight (54–57 kg)' },
  { value: 'Lightweight',        label: 'Lightweight (57–60 kg)' },
  { value: 'Light Middleweight', label: 'Light Middleweight (65–70 kg)' },
  { value: 'Middleweight',       label: 'Middleweight (Up to 75 kg)' },
  { value: 'Light Heavyweight',  label: 'Light Heavyweight (Up to 81 kg)' },
  { value: 'Heavyweight',        label: 'Heavyweight (Above 81 kg)' },
]

const ROLES = [
  { value: 'fan',     label: 'Fan',     desc: 'Follow fighters & events' },
  { value: 'fighter', label: 'Fighter', desc: 'Showcase your record & career' },
  { value: 'coach',   label: 'Coach',   desc: 'Train fighters & manage your gym' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const tutorial = useContext(TutorialContext)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '',
    role: '',
    gender: '', weightClass: '', wins: '', losses: '', draws: '',
    location: '', gym: '', age: '',
    gymCity: '', gymPhone: '', gymWebsite: '', gymDescription: '',
  })
  const [gymStatus, setGymStatus] = useState(null) // null | 'checking' | 'existing' | 'new'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldVal, setFieldVal] = useState({ name: null, username: null, email: null, password: null })
  const usernameTimer = useRef(null)

  const checkUsernameAvailability = (value) => {
    clearTimeout(usernameTimer.current)
    usernameTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/auth/check-username', { params: { username: value.trim() } })
        setFieldVal(prev => ({
          ...prev,
          username: data.available
            ? { type: 'ok',  msg: '✓ Username is available' }
            : { type: 'bad', msg: '✗ Username already taken' },
        }))
      } catch {
        // silently ignore network errors on live check
      }
    }, 500)
  }

  const validate = (field, value) => {
    if (field === 'name') {
      if (!value.trim()) return null
      if (value.trim().length < 2) return { type: 'bad', msg: '✗ At least 2 characters required' }
      return { type: 'ok', msg: '✓ Looks good' }
    }
    if (field === 'email') {
      if (!value.trim()) return null
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
        ? { type: 'ok', msg: '✓ Looks good' }
        : { type: 'bad', msg: '✗ Enter a valid email address' }
    }
    if (field === 'password') {
      if (!value) return null
      if (value.length < 6) return { type: 'bad', msg: '✗ Minimum 6 characters' }
      let s = 0
      if (value.length >= 8)          s++
      if (value.length >= 12)         s++
      if (/[A-Z]/.test(value))        s++
      if (/[0-9]/.test(value))        s++
      if (/[^a-zA-Z0-9]/.test(value)) s++
      if (s <= 2) return { type: 'warn', msg: '⚠ Weak — add numbers or symbols' }
      if (s <= 3) return { type: 'warn', msg: '⚡ Medium strength' }
      return { type: 'ok', msg: '✓ Strong password' }
    }
    if (field === 'username') {
      if (!value.trim()) return null
      if (value.trim().length < 3)  return { type: 'bad',  msg: '✗ At least 3 characters required' }
      if (value.trim().length > 20) return { type: 'bad',  msg: '✗ Max 20 characters' }
      if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) return { type: 'bad', msg: '✗ Letters, numbers and underscores only' }
      return { type: 'ok', msg: '✓ Username looks good' }
    }
    return null
  }

  const set = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'gym') setGymStatus(null)
    if (['name', 'username', 'email', 'password'].includes(field)) {
      const result = validate(field, value)
      setFieldVal(prev => ({ ...prev, [field]: result }))
      if (field === 'username' && result?.type === 'ok') {
        setFieldVal(prev => ({ ...prev, username: { type: 'warn', msg: 'Checking…' } }))
        checkUsernameAvailability(value)
      }
    }
  }

  const checkGym = async (e) => {
    e.preventDefault()
    if (!form.gym.trim()) { setError('Please enter a gym name.'); return }
    setError('')
    setGymStatus('checking')
    try {
      const { data } = await api.get('/gyms/search', { params: { name: form.gym.trim() } })
      setGymStatus(data.gym ? 'existing' : 'new')
    } catch {
      setError('Could not check gym. Please try again.')
      setGymStatus(null)
    }
  }

  const totalSteps = (form.role === 'fighter' || form.role === 'coach') ? 3 : 2

  const goNext = async (e) => {
    e.preventDefault()
    setError('')
    if (step === 1) {
      if (!form.name.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
        setError('Please fill in all fields.')
        return
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username.trim())) {
        setError('Username must be 3–20 characters, letters, numbers and underscores only.')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError('Please enter a valid email address.')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      setLoading(true)
      try {
        const [emailRes, usernameRes] = await Promise.all([
          api.get('/auth/check-email',    { params: { email:    form.email.trim() } }),
          api.get('/auth/check-username', { params: { username: form.username.trim() } }),
        ])
        if (!emailRes.data.available) {
          setError('An account with this email already exists.')
          setFieldVal(prev => ({ ...prev, email: { type: 'bad', msg: '✗ Email already in use' } }))
          return
        }
        if (!usernameRes.data.available) {
          setError('That username is already taken.')
          setFieldVal(prev => ({ ...prev, username: { type: 'bad', msg: '✗ Username already taken' } }))
          return
        }
      } catch {
        setError('Could not verify details. Please try again.')
        return
      } finally {
        setLoading(false)
      }
      setStep(2)
    } else if (step === 2) {
      if (!form.role) {
        setError('Please select your role.')
        return
      }
      if (form.role === 'fighter' || form.role === 'coach') {
        setStep(3)
      } else {
        submit()
      }
    }
  }

  const submit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      tutorial?.startTutorial()
      navigate('/check-email', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Account', 'Role', 'Profile']

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Boxing Amateur" className="auth-logo" />
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).flatMap((n, i) => {
            const items = [
              <div key={`dot-${n}`} className={`step-dot${step >= n ? ' active' : ''}`}>
                {step > n ? '✓' : n}
              </div>,
            ]
            if (i < totalSteps - 1) {
              items.push(
                <div key={`line-${n}`} className={`step-line${step > n ? ' active' : ''}`} />
              )
            }
            return items
          })}
        </div>

        <h2 className="auth-title">
          {step === 1 ? 'Create Account' : step === 2 ? 'I Am A\u2026' : form.role === 'coach' ? 'Your Gym' : 'Fighter Profile'}
        </h2>

        {error && <div className="error-banner">{error}</div>}

        {/* Step 1 – basic info */}
        {step === 1 && (
          <form onSubmit={goNext}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name" className={`input${fieldVal.name ? ` input--${fieldVal.name.type}` : ''}`}
                type="text" placeholder="Your name" value={form.name}
                onChange={set('name')} required autoComplete="name"
              />
              {fieldVal.name && <p className={`field-val field-val--${fieldVal.name.type}`}>{fieldVal.name.msg}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username" className={`input${fieldVal.username ? ` input--${fieldVal.username.type}` : ''}`}
                type="text" placeholder="e.g. IronMike99" value={form.username}
                onChange={set('username')} required autoComplete="username"
              />
              {fieldVal.username && <p className={`field-val field-val--${fieldVal.username.type}`}>{fieldVal.username.msg}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email" className={`input${fieldVal.email ? ` input--${fieldVal.email.type}` : ''}`}
                type="email" placeholder="you@example.com" value={form.email}
                onChange={set('email')} required autoComplete="email"
              />
              {fieldVal.email && <p className={`field-val field-val--${fieldVal.email.type}`}>{fieldVal.email.msg}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" className={`input${fieldVal.password ? ` input--${fieldVal.password.type}` : ''}`}
                type="password" placeholder="••••••••" value={form.password}
                onChange={set('password')} required autoComplete="new-password"
              />
              {fieldVal.password && <p className={`field-val field-val--${fieldVal.password.type}`}>{fieldVal.password.msg}</p>}
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Next'}
            </button>
          </form>
        )}

        {/* Step 2 – role selection */}
        {step === 2 && (
          <form onSubmit={goNext}>
            <div className="role-cards">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-card${form.role === r.value ? ' selected' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, role: r.value }))}
                >
                  <span className="role-card-label">{r.label}</span>
                  <span className="role-card-desc">{r.desc}</span>
                </button>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(1) }}>
                Back
              </button>
              <button className="btn btn-primary btn-row-grow" type="submit">
                {(form.role === 'fighter' || form.role === 'coach') ? 'Next' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3 – coach gym */}
        {step === 3 && form.role === 'coach' && (
          <form onSubmit={gymStatus ? submit : checkGym}>
            {/* Gym name + check */}
            <div className="form-group">
              <label className="form-label" htmlFor="gym">Gym Name</label>
              <input
                id="gym" className="input" type="text"
                placeholder="e.g. Kronk Gym" value={form.gym}
                onChange={set('gym')} required
                disabled={gymStatus === 'existing' || gymStatus === 'new'}
              />
            </div>

            {/* Existing gym confirmation */}
            {gymStatus === 'existing' && (
              <div className="gym-status gym-status--found">
                This gym already exists — you&apos;ll be added as a coach.
              </div>
            )}

            {/* New gym – extra details */}
            {gymStatus === 'new' && (
              <>
                <div className="gym-status gym-status--new">
                  New gym! Fill in what you know (all optional).
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gymCity">City / Location</label>
                  <input
                    id="gymCity" className="input" type="text"
                    placeholder="e.g. Detroit, MI" value={form.gymCity}
                    onChange={set('gymCity')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gymPhone">Phone</label>
                  <input
                    id="gymPhone" className="input" type="tel"
                    placeholder="e.g. (313) 555-0100" value={form.gymPhone}
                    onChange={set('gymPhone')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gymWebsite">Website</label>
                  <input
                    id="gymWebsite" className="input" type="url"
                    placeholder="https://yourgym.com" value={form.gymWebsite}
                    onChange={set('gymWebsite')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gymDescription">Description</label>
                  <textarea
                    id="gymDescription" className="input textarea"
                    placeholder="Tell fighters about your gym…"
                    value={form.gymDescription} onChange={set('gymDescription')}
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="btn-row">
              <button
                className="btn btn-outline" type="button"
                onClick={() => { setError(''); gymStatus ? setGymStatus(null) : setStep(2) }}
              >
                Back
              </button>
              {!gymStatus && (
                <button className="btn btn-primary btn-row-grow" type="submit" disabled={gymStatus === 'checking'}>
                  {gymStatus === 'checking' ? 'Checking…' : 'Check Gym'}
                </button>
              )}
              {gymStatus && (
                <button className="btn btn-primary btn-row-grow" type="submit" disabled={loading}>
                  {loading ? 'Creating Account…' : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step 3 – fighter profile */}
        {step === 3 && form.role === 'fighter' && (
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="gender">Division</label>
              <select
                id="gender" className="input"
                value={form.gender} onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value, weightClass: '' }))} required
              >
                <option value="">Select division</option>
                <option value="male">Men&apos;s</option>
                <option value="female">Women&apos;s</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="weightClass">Weight Class</label>
              <select
                id="weightClass" className="input"
                value={form.weightClass} onChange={set('weightClass')} required
                disabled={!form.gender}
              >
                <option value="">{form.gender ? 'Select weight class' : 'Select division first'}</option>
                {(form.gender === 'male' ? MENS_WEIGHT_CLASSES : WOMENS_WEIGHT_CLASSES).map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Record</label>
              <div className="record-row">
                <div className="record-input-wrap">
                  <input
                    className="input" type="number" min="0"
                    placeholder="0" value={form.wins}
                    onChange={set('wins')} required
                  />
                  <span className="record-input-label">Wins</span>
                </div>
                <div className="record-input-wrap">
                  <input
                    className="input" type="number" min="0"
                    placeholder="0" value={form.losses}
                    onChange={set('losses')} required
                  />
                  <span className="record-input-label">Losses</span>
                </div>
                <div className="record-input-wrap">
                  <input
                    className="input" type="number" min="0"
                    placeholder="0" value={form.draws}
                    onChange={set('draws')} required
                  />
                  <span className="record-input-label">Draws</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Location</label>
              <input
                id="location" className="input" type="text"
                placeholder="City, State" value={form.location}
                onChange={set('location')} required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gym">Current Boxing Gym</label>
              <input
                id="gym" className="input" type="text"
                placeholder="Gym name" value={form.gym}
                onChange={set('gym')} required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="age">Age</label>
              <input
                id="age" className="input" type="number"
                min="16" max="60" placeholder="Your age"
                value={form.age} onChange={set('age')} required
              />
            </div>

            <div className="btn-row">
              <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(2) }}>
                Back
              </button>
              <button className="btn btn-primary btn-row-grow" type="submit" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
