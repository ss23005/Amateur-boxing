import { useState, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import logo from '../../assets/logo.svg'

const FEATURES = [
  { text: 'Track your record & career' },
  { text: 'Climb the amateur leaderboard' },
  { text: 'Find gyms near you' },
  { text: 'Connect with the community' },
]

export default function CheckEmail() {
  const location = useLocation()
  const navigate  = useNavigate()
  const email = location.state?.email ?? 'your inbox'

  const [digits, setDigits]       = useState(['', '', '', '', '', ''])
  const [error, setError]         = useState('')
  const [resendStatus, setResend] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const inputs = useRef([])

  const handleDigit = (i, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[i] = value.slice(-1)
    setDigits(next)
    setError('')
    if (value && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...digits]
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const verify = async (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError('Enter all 6 digits.'); return }
    setVerifying(true)
    setError('')
    try {
      await api.post('/auth/verify-email', { code })
      navigate('/discover')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Incorrect code. Please try again.')
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const resend = async () => {
    setResend('sending')
    try {
      await api.post('/auth/resend-verification')
      setResend('sent')
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } catch {
      setResend('error')
    }
  }

  const filled = digits.filter(Boolean).length

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
            Wrong account?&nbsp;<Link to="/sign-in" className="psh-topbar-signin">Sign in</Link>
          </span>
        </div>
        <div className="presignup-form-inner">

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 className="auth-title" style={{ marginBottom: 8 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>
          </div>

          <form onSubmit={verify}>
            <div className="otp-row" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  className={`otp-input${error ? ' otp-input--error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <p style={{ color: 'var(--accent)', fontSize: 13, textAlign: 'center', margin: '12px 0 0' }}>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={verifying || filled < 6}
              style={{ width: '100%', marginTop: 24 }}
            >
              {verifying ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            {resendStatus === 'sent' && (
              <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, marginBottom: 8 }}>
                ✓ New code sent — check your inbox
              </p>
            )}
            {resendStatus === 'error' && (
              <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>
                Could not resend. Please try again.
              </p>
            )}
            <button
              className="btn-link"
              onClick={resend}
              disabled={resendStatus === 'sending' || resendStatus === 'sent'}
              type="button"
            >
              {resendStatus === 'sending' ? 'Sending…' : "Didn't get it? Resend code"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
