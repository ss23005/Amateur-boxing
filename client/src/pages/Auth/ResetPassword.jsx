import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import logo from '../../assets/Amateur-Boxing-Logo.png'

const FEATURES = [
  { text: 'Track your record & career' },
  { text: 'Climb the amateur leaderboard' },
  { text: 'Find gyms near you' },
  { text: 'Connect with the community' },
]

export default function ResetPassword() {
  const { token }  = useParams()
  const navigate   = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [status,   setStatus]   = useState(null) // null | 'saving' | 'done'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }
    setStatus('saving')
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setStatus('done')
      setTimeout(() => navigate('/sign-in'), 2500)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Reset failed. The link may have expired.')
      setStatus(null)
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
            Remember it?&nbsp;<Link to="/sign-in" className="psh-topbar-signin">Sign in</Link>
          </span>
        </div>
        <div className="presignup-form-inner">

          {status === 'done' ? (
            <div style={{ textAlign: 'center' }}>
              <h2 className="auth-title" style={{ marginBottom: 12 }}>Password updated</h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7, margin: '0 0 8px' }}>
                Your password has been changed successfully.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-4)', margin: 0 }}>
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <>
              <h2 className="auth-title">New Password</h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 28px', lineHeight: 1.65 }}>
                Choose a new password for your account.
              </p>

              {error && <div className="error-banner">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rp-password">New Password</label>
                  <input
                    id="rp-password"
                    className="input"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rp-confirm">Confirm Password</label>
                  <input
                    id="rp-confirm"
                    className="input"
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button className="btn btn-primary" type="submit" disabled={status === 'saving'} style={{ width: '100%' }}>
                  {status === 'saving' ? 'Saving…' : 'Set New Password'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link to="/sign-in" className="btn-link" style={{ fontSize: 13 }}>← Back to Sign In</Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
