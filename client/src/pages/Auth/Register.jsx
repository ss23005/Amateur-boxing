import { useState, useContext } from 'react'
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
    name: '', email: '', password: '',
    role: '',
    gender: '', weightClass: '', wins: '', losses: '', draws: '',
    location: '', gym: '', age: '',
    gymCity: '', gymPhone: '', gymWebsite: '', gymDescription: '',
  })
  const [gymStatus, setGymStatus] = useState(null) // null | 'checking' | 'existing' | 'new'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    // Reset gym check if the gym name is edited
    if (field === 'gym') setGymStatus(null)
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

  const goNext = (e) => {
    e.preventDefault()
    setError('')
    if (step === 1) {
      if (!form.name || !form.email || !form.password) {
        setError('Please fill in all fields.')
        return
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
      navigate('/feed')
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
          <img src={logo} alt="Amateur Boxing World" className="auth-logo" />
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
                id="name" className="input" type="text"
                placeholder="Your name" value={form.name}
                onChange={set('name')} required autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email" className="input" type="email"
                placeholder="you@example.com" value={form.email}
                onChange={set('email')} required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" className="input" type="password"
                placeholder="••••••••" value={form.password}
                onChange={set('password')} required autoComplete="new-password"
              />
            </div>
            <button className="btn btn-primary" type="submit">Next</button>
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
