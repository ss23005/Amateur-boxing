import { useState, useContext, useRef, useEffect } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { TutorialContext } from '../../context/TutorialContext'
import api from '../../services/api'
import logo from '../../assets/Amateur-Boxing-Logo.png'

const MENS_WEIGHT_CLASSES = [
  { value: 'Minimumweight',      label: 'Minimumweight (Up to 49 kg / 108 lbs)' },
  { value: 'Flyweight',          label: 'Flyweight (Up to 52 kg / 115 lbs)' },
  { value: 'Bantamweight',       label: 'Bantamweight (Up to 56 kg / 123 lbs)' },
  { value: 'Lightweight',        label: 'Lightweight (Up to 60 kg / 132 lbs)' },
  { value: 'Light Welterweight', label: 'Light Welterweight (Up to 64 kg / 141 lbs)' },
  { value: 'Welterweight',       label: 'Welterweight (Up to 69 kg / 152 lbs)' },
  { value: 'Middleweight',       label: 'Middleweight (Up to 75 kg / 165 lbs)' },
  { value: 'Light Heavyweight',  label: 'Light Heavyweight (Up to 81 kg / 178 lbs)' },
  { value: 'Heavyweight',        label: 'Heavyweight (Up to 91 kg / 201 lbs)' },
  { value: 'Super Heavyweight',  label: 'Super Heavyweight (Over 91 kg / 201 lbs)' },
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

const FEATURES = [
  { text: 'Track your record & career' },
  { text: 'Climb the amateur leaderboard' },
  { text: 'Find gyms near you' },
  { text: 'Connect with the community' },
]

export default function PreSignup() {
  const { register, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const tutorial = useContext(TutorialContext)

  if (!authLoading && user) return <Navigate to="/discover" replace />

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '',
    role: '',
    // Fighter fields
    gender: '', weightClass: '', wins: '', losses: '', draws: '',
    location: '', gym: '', age: '',
    // Coach — new club fields
    gymMode: '',        // 'existing' | 'new'
    selectedGymId: '',  // for existing club
    gymAddress: '', gymCity: '', gymPostcode: '', gymCountry: '',
    gymPhone: '', gymWebsite: '', gymDescription: '',
    gymBrandColor: '',
    gymLogo: '',        // base64 data URL
  })
  const [gyms,        setGyms]       = useState([])
  const [gymsLoading, setGymsLoading] = useState(false)
  const [gymSearch,   setGymSearch]  = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldVal, setFieldVal] = useState({ name: null, username: null, email: null, password: null })
  const usernameTimer = useRef(null)
  const fileInputRef  = useRef(null)

  // Load gym list for fighter step 3 and coach existing-club step 4
  useEffect(() => {
    const needGyms =
      (step === 3 && form.role === 'fighter') ||
      (step === 4 && form.gymMode === 'existing')
    if (needGyms && gyms.length === 0) {
      setGymsLoading(true)
      api.get('/gyms', { params: { all: 'true' } })
        .then(({ data }) => setGyms(data))
        .catch(() => {})
        .finally(() => setGymsLoading(false))
    }
  }, [step, form.role, form.gymMode])

  const filteredGyms = gyms.filter(g => {
    const q = gymSearch.toLowerCase()
    return !q || g.name.toLowerCase().includes(q) || g.city?.toLowerCase().includes(q)
  })

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
      } catch {}
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
      if (value.trim().length < 3)  return { type: 'bad', msg: '✗ At least 3 characters required' }
      if (value.trim().length > 20) return { type: 'bad', msg: '✗ Max 20 characters' }
      if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) return { type: 'bad', msg: '✗ Letters, numbers and underscores only' }
      return { type: 'ok', msg: '✓ Username looks good' }
    }
    return null
  }

  const set = (field) => (e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (['name', 'username', 'email', 'password'].includes(field)) {
      const result = validate(field, value)
      setFieldVal(prev => ({ ...prev, [field]: result }))
      if (field === 'username' && result?.type === 'ok') {
        setFieldVal(prev => ({ ...prev, username: { type: 'warn', msg: 'Checking…' } }))
        checkUsernameAvailability(value)
      }
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setLogoPreview(dataUrl)
      setForm(prev => ({ ...prev, gymLogo: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview('')
    setForm(prev => ({ ...prev, gymLogo: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // How many steps to show in the indicator
  const totalSteps = form.role === 'coach' ? 4 : form.role === 'fighter' ? 3 : 2

  const stepTitle = (() => {
    if (step === 1) return 'Create Your Account'
    if (step === 2) return 'I Am A…'
    if (step === 3) return form.role === 'coach' ? 'Your Club' : 'Fighter Profile'
    if (step === 4) return form.gymMode === 'new' ? 'Club Details' : 'Select Your Club'
    return ''
  })()

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
      return
    }

    if (step === 2) {
      if (!form.role) { setError('Please select your role.'); return }
      if (form.role === 'fighter' || form.role === 'coach') setStep(3)
      else submit()
      return
    }

    if (step === 3 && form.role === 'coach') {
      if (!form.gymMode) { setError('Please choose New Club or Existing Club.'); return }
      setStep(4)
      return
    }
  }

  const submit = async (e) => {
    if (e) e.preventDefault()
    setError('')

    // Validate new club minimum
    if (form.role === 'coach' && form.gymMode === 'new' && !form.gym.trim()) {
      setError('Please enter your club name.')
      return
    }
    // Validate existing club selection
    if (form.role === 'coach' && form.gymMode === 'existing' && !form.selectedGymId) {
      setError('Please select your club from the list.')
      return
    }

    setLoading(true)
    try {
      await register({ ...form, source: 'presignup' })
      tutorial?.startTutorial()
      navigate('/check-email', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="presignup-layout">
      {/* ── Left hero panel ── */}
      <div className="presignup-hero">
        <div className="psh-brand-row">
          <img src={logo} alt="Boxing Amateur" className="psh-logo" />
          <div className="psh-brand-text">
            <span className="psh-brand-abbr">BA</span>
            <span className="psh-brand-full">Boxing Amateur</span>
          </div>
        </div>

        <div className="psh-headline">
          <p className="psh-hl-eyebrow">The Home of</p>
          <h1 className="psh-hl-main">
            <span className="psh-hl-line">Boxing</span>
            <span className="psh-hl-line psh-hl-line--red">Amateur</span>
          </h1>
          <div className="psh-rule" />
          <p className="psh-sub">Track records, find gyms, and connect with fighters worldwide.</p>
        </div>

        <div className="psh-bottom">
          <ul className="psh-features">
            {FEATURES.map((f, i) => (
              <li key={f.text} className="psh-feature">
                <span className="psh-feature-num">0{i + 1}</span>
                <span className="psh-feature-text">{f.text}</span>
              </li>
            ))}
          </ul>
          <div className="psh-footer-strip">
            <span>100% Free to Join</span>
            <span aria-hidden="true">·</span>
            <span>Grass Roots to Greatness</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="presignup-form-panel">
        <div className="presignup-form-topbar">
          <span className="psh-topbar-auth">
            Already a member?&nbsp;<Link to="/sign-in" className="psh-topbar-signin">Sign in</Link>
          </span>
        </div>
        <div className="presignup-form-inner">

          {/* Step indicator */}
          <div className="step-indicator" style={{ marginBottom: 24 }}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).flatMap((n, i) => {
              const items = [
                <div key={`dot-${n}`} className={`step-dot${step >= n ? ' active' : ''}`}>
                  {step > n ? '✓' : n}
                </div>,
              ]
              if (i < totalSteps - 1) {
                items.push(<div key={`line-${n}`} className={`step-line${step > n ? ' active' : ''}`} />)
              }
              return items
            })}
          </div>

          <h2 className="auth-title">{stepTitle}</h2>

          {error && <div className="error-banner">{error}</div>}

          {/* ── Step 1: Account details ── */}
          {step === 1 && (
            <form onSubmit={goNext}>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-name">Full Name</label>
                <input
                  id="ps-name" className={`input${fieldVal.name ? ` input--${fieldVal.name.type}` : ''}`}
                  type="text" placeholder="Your name" value={form.name}
                  onChange={set('name')} required autoComplete="name"
                />
                {fieldVal.name && <p className={`field-val field-val--${fieldVal.name.type}`}>{fieldVal.name.msg}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-username">Username</label>
                <input
                  id="ps-username" className={`input${fieldVal.username ? ` input--${fieldVal.username.type}` : ''}`}
                  type="text" placeholder="e.g. IronMike99" value={form.username}
                  onChange={set('username')} required autoComplete="username"
                />
                {fieldVal.username && <p className={`field-val field-val--${fieldVal.username.type}`}>{fieldVal.username.msg}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-email">Email Address</label>
                <input
                  id="ps-email" className={`input${fieldVal.email ? ` input--${fieldVal.email.type}` : ''}`}
                  type="email" placeholder="you@example.com" value={form.email}
                  onChange={set('email')} required autoComplete="email"
                />
                {fieldVal.email && <p className={`field-val field-val--${fieldVal.email.type}`}>{fieldVal.email.msg}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-password">Password</label>
                <input
                  id="ps-password" className={`input${fieldVal.password ? ` input--${fieldVal.password.type}` : ''}`}
                  type="password" placeholder="••••••••" value={form.password}
                  onChange={set('password')} required autoComplete="new-password"
                />
                {fieldVal.password && <p className={`field-val field-val--${fieldVal.password.type}`}>{fieldVal.password.msg}</p>}
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Checking…' : 'Next →'}
              </button>
            </form>
          )}

          {/* ── Step 2: Role ── */}
          {step === 2 && (
            <form onSubmit={goNext}>
              <div className="role-cards">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`role-card${form.role === r.value ? ' selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                  >
                    <span className="role-card-label">{r.label}</span>
                    <span className="role-card-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
              <div className="btn-row">
                <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(1) }}>Back</button>
                <button className="btn btn-primary btn-row-grow" type="submit">
                  {form.role === 'fan' ? 'Create Account' : 'Next'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Fighter profile ── */}
          {step === 3 && form.role === 'fighter' && (
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-gender">Division</label>
                <select
                  id="ps-gender" className="input"
                  value={form.gender} onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value, weightClass: '' }))} required
                >
                  <option value="">Select division</option>
                  <option value="male">Men's</option>
                  <option value="female">Women's</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-weightClass">Weight Class</label>
                <select
                  id="ps-weightClass" className="input"
                  value={form.weightClass} onChange={set('weightClass')} required disabled={!form.gender}
                >
                  <option value="">{form.gender ? 'Select weight class' : 'Select division first'}</option>
                  {(form.gender === 'male' ? MENS_WEIGHT_CLASSES : WOMENS_WEIGHT_CLASSES).map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Record</label>
                <div className="record-row">
                  <div className="record-input-wrap">
                    <input className="input" type="number" min="0" placeholder="0" value={form.wins} onChange={set('wins')} required />
                    <span className="record-input-label">Wins</span>
                  </div>
                  <div className="record-input-wrap">
                    <input className="input" type="number" min="0" placeholder="0" value={form.losses} onChange={set('losses')} required />
                    <span className="record-input-label">Losses</span>
                  </div>
                  <div className="record-input-wrap">
                    <input className="input" type="number" min="0" placeholder="0" value={form.draws} onChange={set('draws')} required />
                    <span className="record-input-label">Draws</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-location">Location</label>
                <input id="ps-location" className="input" type="text" placeholder="City, State" value={form.location} onChange={set('location')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Boxing Club</label>
                {form.selectedGymId ? (
                  <div className="gym-selected-chip">
                    <span className="gym-selected-name">{form.gym}</span>
                    <button
                      type="button"
                      className="gym-selected-change"
                      onClick={() => { setForm(p => ({ ...p, selectedGymId: '', gym: '' })); setGymSearch('') }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="filter-search-wrap" style={{ marginBottom: 8 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
                        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                      </svg>
                      <input
                        className="filter-search-input"
                        type="text"
                        placeholder="Search clubs by name or city…"
                        value={gymSearch}
                        onChange={e => setGymSearch(e.target.value)}
                      />
                    </div>
                    {gymsLoading && (
                      <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '8px 0' }}>Loading clubs…</p>
                    )}
                    {!gymsLoading && gymSearch && filteredGyms.length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '8px 0' }}>No clubs matching "{gymSearch}"</p>
                    )}
                    {!gymsLoading && gymSearch.trim() && filteredGyms.length > 0 && (
                      <div className="gym-select-list" style={{ maxHeight: 200 }}>
                        {filteredGyms.map(g => (
                          <button
                            key={g._id}
                            type="button"
                            className="gym-select-item"
                            onClick={() => { setForm(p => ({ ...p, selectedGymId: g._id, gym: g.name })); setGymSearch('') }}
                          >
                            <div className="gym-select-avatar">{g.name.charAt(0).toUpperCase()}</div>
                            <div className="gym-select-info">
                              <span className="gym-select-name">{g.name}</span>
                              {(g.city || g.country) && (
                                <span className="gym-select-location">{[g.city, g.country].filter(Boolean).join(', ')}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-age">Age</label>
                <input id="ps-age" className="input" type="number" min="16" max="60" placeholder="Your age" value={form.age} onChange={set('age')} required />
              </div>
              <div className="btn-row">
                <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(2) }}>Back</button>
                <button className="btn btn-primary btn-row-grow" type="submit" disabled={loading}>
                  {loading ? 'Creating Account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Coach — new or existing club ── */}
          {step === 3 && form.role === 'coach' && (
            <form onSubmit={goNext}>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
                Are you registering a new club, or joining one that's already on the platform?
              </p>
              <div className="role-cards">
                <button
                  type="button"
                  className={`role-card${form.gymMode === 'existing' ? ' selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, gymMode: 'existing', gym: '', gymLogo: '', gymBrandColor: '' }))}
                >
                  <span className="role-card-label">Existing Club</span>
                  <span className="role-card-desc">Find and join a club already on the platform</span>
                </button>
                <button
                  type="button"
                  className={`role-card${form.gymMode === 'new' ? ' selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, gymMode: 'new', selectedGymId: '', gymAddress: '', gymCity: '', gymPostcode: '', gymCountry: '' }))}
                >
                  <span className="role-card-label">New Club</span>
                  <span className="role-card-desc">Register your club on Boxing Amateur</span>
                </button>
              </div>
              <div className="btn-row">
                <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(2) }}>Back</button>
                <button className="btn btn-primary btn-row-grow" type="submit" disabled={!form.gymMode}>Next</button>
              </div>
            </form>
          )}

          {/* ── Step 4: Coach — select existing club ── */}
          {step === 4 && form.role === 'coach' && form.gymMode === 'existing' && (
            <form onSubmit={submit}>
              <div className="filter-search-wrap" style={{ marginBottom: 16 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  className="filter-search-input"
                  type="text"
                  placeholder="Search by club name or city…"
                  value={gymSearch}
                  onChange={e => setGymSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {gymsLoading && <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 16 }}>Loading clubs…</p>}

              {!gymsLoading && !gymSearch.trim() && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 16 }}>
                  Start typing to search for your club…
                </p>
              )}

              {!gymsLoading && gymSearch.trim() && filteredGyms.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 16 }}>
                  No clubs matching "{gymSearch}"
                </p>
              )}

              {!gymsLoading && gymSearch.trim() && filteredGyms.length > 0 && (
                <div className="gym-select-list">
                  {filteredGyms.map(g => (
                    <button
                      key={g._id}
                      type="button"
                      className={`gym-select-item${form.selectedGymId === g._id ? ' selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, selectedGymId: g._id }))}
                    >
                      <div className="gym-select-avatar">{g.name.charAt(0).toUpperCase()}</div>
                      <div className="gym-select-info">
                        <span className="gym-select-name">{g.name}</span>
                        {(g.city || g.country) && (
                          <span className="gym-select-location">
                            {[g.city, g.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      {form.selectedGymId === g._id && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gym-select-check">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="btn-row" style={{ marginTop: 20 }}>
                <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(3) }}>Back</button>
                <button className="btn btn-primary btn-row-grow" type="submit" disabled={loading || !form.selectedGymId}>
                  {loading ? 'Creating Account…' : 'Join Club & Continue'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 4: Coach — create new club ── */}
          {step === 4 && form.role === 'coach' && form.gymMode === 'new' && (
            <form onSubmit={submit}>

              {/* Logo upload */}
              <div className="form-group">
                <label className="form-label">Club Logo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />
                {logoPreview ? (
                  <div className="logo-upload-preview">
                    <img src={logoPreview} alt="Club logo preview" className="logo-upload-img" />
                    <button type="button" className="logo-upload-remove" onClick={removeLogo}>✕ Remove</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="logo-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, marginBottom: 6 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Upload Logo</span>
                    <span style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>PNG, JPG or SVG</span>
                  </button>
                )}
              </div>

              {/* Brand colour */}
              <div className="form-group">
                <label className="form-label">Brand Colour</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    className="color-picker-swatch"
                    value={form.gymBrandColor || '#0a2463'}
                    onChange={e => setForm(prev => ({ ...prev, gymBrandColor: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="input color-picker-hex"
                    value={form.gymBrandColor || '#0a2463'}
                    onChange={e => {
                      const v = e.target.value
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setForm(prev => ({ ...prev, gymBrandColor: v }))
                    }}
                    maxLength={7}
                    spellCheck={false}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Hex colour</span>
                </div>
              </div>

              {/* Club name */}
              <div className="form-group">
                <label className="form-label" htmlFor="ps-gym">Club Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  id="ps-gym" className="input" type="text"
                  placeholder="e.g. Kronk Gym" value={form.gym}
                  onChange={set('gym')} required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymAddress">Street Address</label>
                <input id="ps-gymAddress" className="input" type="text" placeholder="e.g. 14 Broad Street" value={form.gymAddress} onChange={set('gymAddress')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymCity">Town / City</label>
                <input id="ps-gymCity" className="input" type="text" placeholder="e.g. Manchester" value={form.gymCity} onChange={set('gymCity')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymPostcode">Postcode</label>
                <input id="ps-gymPostcode" className="input" type="text" placeholder="e.g. M1 1AA" value={form.gymPostcode} onChange={set('gymPostcode')} style={{ textTransform: 'uppercase' }} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymCountry">Country</label>
                <input id="ps-gymCountry" className="input" type="text" placeholder="e.g. England" value={form.gymCountry} onChange={set('gymCountry')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymDesc">About the Club</label>
                <textarea id="ps-gymDesc" className="input textarea" placeholder="Tell fighters about your club…" value={form.gymDescription} onChange={set('gymDescription')} rows={3} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymPhone">Phone</label>
                <input id="ps-gymPhone" className="input" type="tel" placeholder="e.g. (313) 555-0100" value={form.gymPhone} onChange={set('gymPhone')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ps-gymWebsite">Website</label>
                <input id="ps-gymWebsite" className="input" type="url" placeholder="https://yourgym.com" value={form.gymWebsite} onChange={set('gymWebsite')} />
              </div>

              <div className="btn-row">
                <button className="btn btn-outline" type="button" onClick={() => { setError(''); setStep(3) }}>Back</button>
                <button className="btn btn-primary btn-row-grow" type="submit" disabled={loading}>
                  {loading ? 'Creating Account…' : 'Register Club & Continue'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
