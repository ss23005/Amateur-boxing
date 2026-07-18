import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'

function GymCard({ gym }) {
  const initial = (gym.name ?? '?').charAt(0).toUpperCase()
  const fighterCount = gym.fighterCount ?? 0

  return (
    <Link to={`/gyms/${gym.slug || gym._id}`} className="user-card">
      {gym.logo ? (
        <img src={gym.logo} alt={gym.name} className="user-card-avatar" style={{ objectFit: 'cover', borderRadius: 10 }} />
      ) : (
        <div className="user-card-avatar">{initial}</div>
      )}
      <div className="user-card-name">{gym.name}</div>
      {(gym.city || gym.country) && (
        <div className="user-card-username">
          {[gym.city, gym.country].filter(Boolean).join(', ')}
        </div>
      )}
      <span
        className="user-card-role-badge"
        style={{ background: 'rgba(10,36,99,0.10)', color: '#0a2463' }}
      >
        Gym
      </span>
      {fighterCount > 0 && (
        <div className="user-card-record">
          <span className="user-card-stat user-card-stat--w">{fighterCount} fighter{fighterCount !== 1 ? 's' : ''}</span>
        </div>
      )}
      {gym.description && (
        <div className="user-card-weight" style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 400, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {gym.description}
        </div>
      )}
    </Link>
  )
}

export default function Discover() {
  const { data: gymsRaw, loading: gymsLoading, error: gymsError } = useFetch('/gyms')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [gymSearch, setGymSearch] = useState('')

  const handleLogout = () => { logout(); navigate('/welcome') }

  const filteredGyms = useMemo(() => {
    if (!gymsRaw) return []
    if (!gymSearch.trim()) return gymsRaw
    const q = gymSearch.toLowerCase()
    return gymsRaw.filter(g =>
      g.name?.toLowerCase().includes(q) ||
      g.city?.toLowerCase().includes(q) ||
      g.country?.toLowerCase().includes(q)
    )
  }, [gymsRaw, gymSearch])

  return (
    <div className="discover-shell">
      <div className="discover-body">

        {/* Top bar */}
        <div className="discover-filter-bar">
          <div className="filter-search-wrap" style={{ flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="filter-search-input"
              type="text"
              placeholder="Search gyms by name or city..."
              value={gymSearch}
              onChange={e => setGymSearch(e.target.value)}
            />
            {gymSearch && (
              <button className="filter-search-clear" onClick={() => setGymSearch('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          {user && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link
                to="/account"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: '#fff', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : user.name.charAt(0).toUpperCase()
                  }
                </span>
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{ padding: '9px 18px', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', background: '#fff', color: 'var(--accent)', fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Gyms section */}
        <div className="discover-section-header">
          <h2 className="discover-section-title">Gyms</h2>
          {!gymsLoading && gymsRaw && (
            <span className="discover-section-count">
              {filteredGyms.length} gym{filteredGyms.length !== 1 ? 's' : ''}
              {gymSearch && ` matching "${gymSearch}"`}
            </span>
          )}
        </div>

        {gymsLoading && <div className="loading-state">Loading gyms…</div>}
        {gymsError   && <div className="error-banner">Could not load gyms. Please try again.</div>}

        {!gymsLoading && !gymsError && (
          filteredGyms.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">{gymSearch ? `No gyms matching "${gymSearch}"` : 'No gyms listed yet'}</p>
              <p className="empty-state-desc">Gyms appear here once registered.</p>
            </div>
          ) : (
            <div className="user-grid">
              {filteredGyms.map(g => <GymCard key={g._id} gym={g} />)}
            </div>
          )
        )}

        {/* All fighters CTA */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1 }}>All Fighters</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>Browse every fighter registered on Boxing Amateur</p>
          </div>
          <Link
            to="/fighters"
            style={{ display: 'inline-block', padding: '10px 22px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--r-sm)', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            View All Fighters →
          </Link>
        </div>

      </div>
    </div>
  )
}
