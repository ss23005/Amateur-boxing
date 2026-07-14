import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'

const ROLE_COLORS = {
  fighter: { bg: 'rgba(232,25,44,0.10)', color: '#c0101f', label: 'Fighter' },
  coach:   { bg: 'rgba(10,36,99,0.10)',  color: '#0a2463', label: 'Coach'   },
  fan:     { bg: 'rgba(110,110,115,0.1)', color: '#48484a', label: 'Fan'   },
}

function UserCard({ user }) {
  const { record, role, weightClass, location } = user
  if (!user.username) return null
  const isFighter = role === 'fighter'
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.fan
  const initial = (user.name ?? '?').charAt(0).toUpperCase()
  const wins   = record?.wins   ?? 0
  const losses = record?.losses ?? 0
  const draws  = record?.draws  ?? 0

  return (
    <Link to={`/users/${user.username}`} className="user-card">
      <div className="user-card-avatar">{initial}</div>
      <div className="user-card-name">{user.name}</div>
      {user.username && <div className="user-card-username">@{user.username}</div>}
      <span className="user-card-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
        {roleStyle.label}
      </span>
      {isFighter && (
        <>
          <div className="user-card-record">
            <span className="user-card-stat user-card-stat--w">{wins}W</span>
            <span className="user-card-stat-sep">·</span>
            <span className="user-card-stat user-card-stat--l">{losses}L</span>
            {draws > 0 && (
              <>
                <span className="user-card-stat-sep">·</span>
                <span className="user-card-stat user-card-stat--d">{draws}D</span>
              </>
            )}
          </div>
          {weightClass && <div className="user-card-weight">{weightClass}</div>}
        </>
      )}
      {location && (
        <div className="user-card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {location}
        </div>
      )}
    </Link>
  )
}

function GymCard({ gym }) {
  const initial = (gym.name ?? '?').charAt(0).toUpperCase()
  const fighterCount = gym.fighterCount ?? 0
  const coachCount   = gym.coachCount   ?? 0

  return (
    <Link to={`/gyms/${gym.slug || gym._id}`} className="user-card">
      <div className="user-card-avatar">{initial}</div>
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
      {(fighterCount > 0 || coachCount > 0) && (
        <div className="user-card-record">
          {fighterCount > 0 && (
            <span className="user-card-stat user-card-stat--w">{fighterCount} fighter{fighterCount !== 1 ? 's' : ''}</span>
          )}
          {fighterCount > 0 && coachCount > 0 && (
            <span className="user-card-stat-sep">·</span>
          )}
          {coachCount > 0 && (
            <span className="user-card-stat user-card-stat--d">{coachCount} coach{coachCount !== 1 ? 'es' : ''}</span>
          )}
        </div>
      )}
      {gym.description && (
        <div className="user-card-weight" style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 400, lineClamp: 2, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
          {gym.description}
        </div>
      )}
    </Link>
  )
}

export default function Discover() {
  const { data: users,  loading: usersLoading,  error: usersError  } = useFetch('/users/public')
  const { data: gymsRaw, loading: gymsLoading, error: gymsError } = useFetch('/gyms')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search,     setSearch]     = useState('')
  const [gymSearch,  setGymSearch]  = useState('')

  const handleLogout = () => { logout(); navigate('/welcome') }

  const filteredFighters = useMemo(() => {
    if (!users) return []
    let results = users.filter(u => u.role === 'fighter')
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.weightClass?.toLowerCase().includes(q)
      )
    }
    return results
  }, [users, search])

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

  const loading = usersLoading || gymsLoading

  return (
    <div className="discover-shell">
      <div className="discover-body">

        {/* Search + logout */}
        <div className="discover-filter-bar">
          <div className="filter-search-wrap" style={{ flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="filter-search-input"
              type="text"
              placeholder="Search fighters by name, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="filter-search-clear" onClick={() => setSearch('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          {user && (
            <button
              onClick={handleLogout}
              style={{
                padding: '9px 18px',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--r-sm)',
                background: '#fff',
                color: 'var(--accent)',
                fontSize: 14,
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Sign out
            </button>
          )}
        </div>

        {/* ── Fighters section ── */}
        <div className="discover-section-header">
          <h2 className="discover-section-title">Fighters</h2>
          {!usersLoading && users && (
            <span className="discover-section-count">
              {filteredFighters.length} fighter{filteredFighters.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </span>
          )}
        </div>

        {usersLoading && <div className="loading-state">Loading community…</div>}
        {usersError   && <div className="error-banner">Could not load members. Please try again.</div>}

        {!usersLoading && !usersError && (
          filteredFighters.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No fighters found</p>
              <p className="empty-state-desc">Try adjusting your search.</p>
            </div>
          ) : (
            <div className="user-grid">
              {filteredFighters.map(u => <UserCard key={u._id} user={u} />)}
            </div>
          )
        )}

        {/* ── Gyms section ── */}
        <div className="discover-section-header" style={{ marginTop: 48 }}>
          <h2 className="discover-section-title">Gyms</h2>
          {!gymsLoading && gymsRaw && (
            <span className="discover-section-count">
              {filteredGyms.length} gym{filteredGyms.length !== 1 ? 's' : ''}
              {gymSearch && ` matching "${gymSearch}"`}
            </span>
          )}
        </div>

        {!gymsLoading && gymsRaw && gymsRaw.length > 0 && (
          <div className="filter-search-wrap" style={{ marginBottom: 20 }}>
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
        )}

        {gymsLoading && <div className="loading-state">Loading gyms…</div>}
        {gymsError   && <div className="error-banner">Could not load gyms. Please try again.</div>}

        {!gymsLoading && !gymsError && (
          filteredGyms.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">{gymSearch ? `No gyms matching "${gymSearch}"` : 'No gyms listed yet'}</p>
              <p className="empty-state-desc">Gyms appear here once approved.</p>
            </div>
          ) : (
            <div className="user-grid">
              {filteredGyms.map(g => <GymCard key={g._id} gym={g} />)}
            </div>
          )
        )}

      </div>
    </div>
  )
}
