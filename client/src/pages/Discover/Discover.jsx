import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'

const ROLE_COLORS = {
  fighter: { bg: 'rgba(232,25,44,0.10)', color: '#c0101f', label: 'Fighter' },
  coach:   { bg: 'rgba(10,36,99,0.10)',  color: '#0a2463', label: 'Coach'   },
  fan:     { bg: 'rgba(110,110,115,0.1)', color: '#48484a', label: 'Fan'   },
}

function UserCard({ user }) {
  const { record, role, weightClass, location } = user
  const isFighter = role === 'fighter'
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.fan
  const initial = (user.name ?? '?').charAt(0).toUpperCase()
  const wins   = record?.wins   ?? 0
  const losses = record?.losses ?? 0
  const draws  = record?.draws  ?? 0

  return (
    <Link to={`/users/${user._id}`} className="user-card">
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

export default function Discover() {
  const { data: users, loading, error } = useFetch('/users/public')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filtered = useMemo(() => {
    if (!users) return []
    let results = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.weightClass?.toLowerCase().includes(q)
      )
    }
    if (roleFilter) results = results.filter(u => u.role === roleFilter)
    return results
  }, [users, search, roleFilter])

  return (
    <div className="discover-shell">
      <div className="discover-body">
        {/* Search + filter */}
        <div className="discover-filter-bar">
          <div className="filter-search-wrap" style={{ flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="filter-search-input"
              type="text"
              placeholder="Search by name, location..."
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
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="fighter">Fighters</option>
            <option value="coach">Coaches</option>
            <option value="fan">Fans</option>
          </select>
        </div>

        {!loading && users && (
          <p className="discover-count">
            {roleFilter || search ? `${filtered.length} of ${users.length}` : users.length} member{users.length !== 1 ? 's' : ''}
          </p>
        )}

        {loading && <div className="loading-state">Loading community…</div>}
        {error   && <div className="error-banner">Could not load members. Please try again.</div>}

        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No members found</p>
              <p className="empty-state-desc">Try adjusting your search.</p>
            </div>
          ) : (
            <div className="user-grid">
              {filtered.map(u => <UserCard key={u._id} user={u} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}

