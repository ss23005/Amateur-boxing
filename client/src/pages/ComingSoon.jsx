import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function ComingSoon() {
  const navigate = useNavigate()

  return (
    <div className="cs-page">
      <div className="cs-card">

        <div className="cs-brand">
          <img src={logo} alt="Amateur Boxing World" className="cs-logo" />
        </div>

        <div className="cs-gloves">
          <svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left glove */}
            <rect x="2" y="16" width="28" height="22" rx="8" fill="currentColor" opacity="0.15"/>
            <rect x="2" y="16" width="28" height="22" rx="8" stroke="currentColor" strokeWidth="2"/>
            <rect x="6" y="10" width="8" height="14" rx="4" fill="currentColor" opacity="0.15"/>
            <rect x="6" y="10" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
            <rect x="16" y="8" width="8" height="14" rx="4" fill="currentColor" opacity="0.15"/>
            <rect x="16" y="8" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
            <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
            {/* Right glove (mirrored) */}
            <rect x="50" y="16" width="28" height="22" rx="8" fill="currentColor" opacity="0.15"/>
            <rect x="50" y="16" width="28" height="22" rx="8" stroke="currentColor" strokeWidth="2"/>
            <rect x="66" y="10" width="8" height="14" rx="4" fill="currentColor" opacity="0.15"/>
            <rect x="66" y="10" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
            <rect x="56" y="8" width="8" height="14" rx="4" fill="currentColor" opacity="0.15"/>
            <rect x="56" y="8" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
            <line x1="50" y1="28" x2="78" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        </div>

        <h1 className="cs-title">Coming Soon</h1>
        <p className="cs-sub">
          We&apos;re still working on this section. Check back soon — it&apos;s going to be worth the wait.
        </p>

        <button className="btn btn-primary cs-btn" onClick={() => navigate('/feed')}>
          Back to Feed
        </button>

      </div>
    </div>
  )
}
