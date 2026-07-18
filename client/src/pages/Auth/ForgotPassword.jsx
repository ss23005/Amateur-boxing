import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import logo from '../../assets/Amateur-Boxing-Logo.png'

const FEATURES = [
  { text: 'Track your record & career' },
  { text: 'Climb the amateur leaderboard' },
  { text: 'Find gyms near you' },
  { text: 'Connect with the community' },
]

export default function ForgotPassword() {
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'done' | 'error'
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setErrMsg('')
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setStatus('done')
    } catch (err) {
      setErrMsg(err.response?.data?.message ?? 'Something went wrong. Please try again.')
      setStatus('error')
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
              <h2 className="auth-title" style={{ marginBottom: 12 }}>Check your inbox</h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7, margin: '0 0 28px' }}>
                If that email is registered we've sent a reset link.<br />
                It expires in <strong style={{ color: 'var(--text)' }}>1 hour</strong>.
              </p>
              <Link to="/sign-in" className="btn btn-outline" style={{ display: 'inline-block', textDecoration: 'none' }}>
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 28px', lineHeight: 1.65 }}>
                Enter the email on your account and we'll send you a link to reset your password.
              </p>

              {status === 'error' && <div className="error-banner">{errMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="fp-email">Email Address</label>
                  <input
                    id="fp-email"
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button className="btn btn-primary" type="submit" disabled={status === 'sending'} style={{ width: '100%' }}>
                  {status === 'sending' ? 'Sending…' : 'Send Reset Link'}
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
