import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.svg'

const FEATURES = [
  { icon: '🥊', text: 'Track your record & career' },
  { icon: '🏆', text: 'Climb the leaderboard' },
  { icon: '📍', text: 'Find gyms near you' },
  { icon: '💬', text: 'Connect with the community' },
]

export default function PreLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        <div className="presignup-hero-inner">
          <img src={logo} alt="Boxing Amateur" className="presignup-hero-logo" />
          <h1 className="presignup-hero-title">Boxing Amateur</h1>
          <p className="presignup-hero-slogan">Grass roots to greatness</p>
          <p className="presignup-hero-sub">The home of amateur boxing. Track records, find gyms, and connect with fighters worldwide.</p>
          <ul className="presignup-features">
            {FEATURES.map(f => (
              <li key={f.text} className="presignup-feature-item">
                <span className="presignup-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="presignup-form-panel">
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
              <label className="form-label" htmlFor="pl-password">Password</label>
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

          <p className="auth-footer">
            No account? <Link to="/welcome">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
