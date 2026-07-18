import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/Amateur-Boxing-Logo.png'

const FEATURES = [
  { text: 'Track your record & career' },
  { text: 'Climb the amateur leaderboard' },
  { text: 'Find gyms near you' },
  { text: 'Connect with the community' },
]

export default function PreLogin() {
  const { login, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!authLoading && user) return <Navigate to="/feed" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      navigate(data.role === 'superadmin' ? '/admin' : '/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
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
            <span className="psh-brand-abbr">BOXINGAMATEUR.COM</span>
            <span className="psh-brand-full">Grass roots to greatness</span>
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
            New here?&nbsp;<Link to="/welcome" className="psh-topbar-signin">Create an account</Link>
          </span>
        </div>
        <div className="presignup-form-inner">

          <h2 className="auth-title">Welcome Back</h2>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="pl-email">Email or Username</label>
              <input
                id="pl-email"
                className="input"
                type="text"
                placeholder="you@example.com or @username"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label className="form-label" htmlFor="pl-password" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="pl-password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
