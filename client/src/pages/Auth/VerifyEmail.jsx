import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import logo from '../../assets/logo.svg'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found.')
      return
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message ?? 'Verification failed. The link may have expired.')
      })
  }, [token])

  return (
    <div className="presignup-layout">
      <div className="presignup-hero">
        <div className="presignup-hero-inner">
          <img src={logo} alt="Boxing Amateur" className="presignup-hero-logo" />
          <h1 className="presignup-hero-title">Boxing Amateur</h1>
          <p className="presignup-hero-sub">The home of amateur boxing.</p>
        </div>
      </div>

      <div className="presignup-form-panel">
        <div className="presignup-form-inner" style={{ textAlign: 'center' }}>

          {status === 'verifying' && (
            <>
              <div className="check-email-icon" style={{ fontSize: 48 }}>⏳</div>
              <h2 className="auth-title">Verifying your email…</h2>
              <p style={{ color: 'var(--text-4)', fontSize: 14 }}>Just a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="check-email-icon" style={{ fontSize: 48 }}>✅</div>
              <h2 className="auth-title">Email verified!</h2>
              <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 32 }}>
                Your account is fully activated. Welcome to Boxing Amateur.
              </p>
              <Link to="/discover" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', maxWidth: 280 }}>
                Explore the Community →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="check-email-icon" style={{ fontSize: 48 }}>❌</div>
              <h2 className="auth-title">Verification failed</h2>
              <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 32 }}>
                {message}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <Link to="/check-email" className="btn btn-outline" style={{ width: '100%', maxWidth: 280 }}>
                  Resend verification email
                </Link>
                <Link to="/welcome" style={{ fontSize: 13, color: 'var(--text-4)' }}>
                  Back to sign up
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
