import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'

function FighterCard({ user }) {
  const { record, weightClass, location } = user
  const wins   = record?.wins   ?? 0
  const losses = record?.losses ?? 0
  const draws  = record?.draws  ?? 0
  const initial = (user.name ?? '?').charAt(0).toUpperCase()

  return (
    <Link to={`/users/${user.username}`} className="user-card">
      <div className="user-card-avatar">{initial}</div>
      <div className="user-card-name">{user.name}</div>
      {user.username && <div className="user-card-username">@{user.username}</div>}
      <span className="user-card-role-badge" style={{ background: 'rgba(232,25,44,0.10)', color: '#c0101f' }}>
        Fighter
      </span>
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
      {user.gymId && user.gymJoinStatus === 'approved' && (
        <div className="user-card-weight" style={{ color: 'var(--navy)', fontSize: 11, fontWeight: 600 }}>
          {user.gymId.name ?? 'Affiliated gym'}
        </div>
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

export default function FighterDirectory() {
  const { data: users, loading, error } = useFetch('/users/public')
  const [search, setSearch] = useState('')

  const fighters = useMemo(() => {
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

  return (
    <div className="discover-shell">
      <div className="discover-body">

        <div style={{ marginBottom: 24 }}>
          <Link to="/discover" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>← Back to Gyms</Link>
        </div>

        <div className="discover-filter-bar">
          <div className="filter-search-wrap" style={{ flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="filter-search-input"
              type="text"
              placeholder="Search by name, location, weight class..."
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
        </div>

        <div className="discover-section-header">
          <h2 className="discover-section-title">All Fighters</h2>
          {!loading && users && (
            <span className="discover-section-count">
              {fighters.length} fighter{fighters.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </span>
          )}
        </div>

        {loading && <div className="loading-state">Loading fighters…</div>}
        {error   && <div className="error-banner">Could not load fighters. Please try again.</div>}

        {!loading && !error && (
          fighters.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">{search ? `No fighters matching "${search}"` : 'No fighters yet'}</p>
              <p className="empty-state-desc">Check back soon.</p>
            </div>
          ) : (
            <div className="user-grid">
              {fighters.map(u => <FighterCard key={u._id} user={u} />)}
            </div>
          )
        )}

      </div>
    </div>
  )
}
