import { useState, useMemo, useRef } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'
import GymMap from './GymMap'


function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

export default function GymDirectory() {
  const { user } = useAuth()
  const { data: gyms, loading, error } = useFetch('/gyms')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const cardRefs = useRef({})

  const handlePinClick = (id) => {
    setSelectedId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Try to match user's city from their location string
  const userCity = user?.location?.split(',')[0]?.trim().toLowerCase() ?? ''

  const filtered = useMemo(() => {
    if (!gyms) return []
    const q = search.toLowerCase()
    return gyms.filter(g =>
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.city.toLowerCase().includes(q) ||
      g.country?.toLowerCase().includes(q)
    )
  }, [gyms, search])

  // Sort: user's city first, then alphabetical
  const sorted = useMemo(() => {
    if (!userCity) return filtered
    return [...filtered].sort((a, b) => {
      const aMatch = a.city.toLowerCase().includes(userCity) ? 0 : 1
      const bMatch = b.city.toLowerCase().includes(userCity) ? 0 : 1
      return aMatch - bMatch || a.city.localeCompare(b.city)
    })
  }, [filtered, userCity])

  if (loading) return <div className="loading-state">Loading gyms…</div>
  if (error)   return <div className="page"><div className="error-banner">{error}</div></div>

  return (
    <div className="page gym-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Find a Gym</p>
          <h1 className="page-title">Gym Directory</h1>
          {user?.location && (
            <p className="fighters-subtitle">Showing results near {user.location}</p>
          )}
        </div>
        {gyms?.length > 0 && (
          <span className="page-count">{gyms.length} gym{gyms.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Live map */}
      <div className="gym-map-wrap">
        <GymMap
          gyms={gyms ?? []}
          selectedId={selectedId}
          onSelect={handlePinClick}
        />
      </div>

      {/* Search */}
      {gyms?.length > 0 && (
        <div className="gym-search-wrap">
          <SearchIcon />
          <input
            className="filter-search-input"
            type="text"
            placeholder="Search by gym name or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Empty state */}
      {gyms?.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No Gyms Listed Yet</p>
          <p className="empty-state-desc">Gyms will appear here once they've been added by an admin.</p>
        </div>
      )}

      {/* Gym grid */}
      {sorted.length === 0 && search && (
        <div className="empty-state">
          <p className="empty-state-title">No results for "{search}"</p>
          <p className="empty-state-desc">Try a different name or city.</p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="gym-grid">
          {sorted.map(gym => {
            const isNearby = userCity && gym.city.toLowerCase().includes(userCity)
            return (
              <div
                key={gym._id}
                ref={el => { cardRefs.current[gym._id] = el }}
                className={`gym-card${isNearby ? ' gym-card--nearby' : ''}${selectedId === gym._id ? ' gym-card--selected' : ''}`}
                onClick={() => setSelectedId(gym._id)}
              >
                <div className="gym-card-header">
                  <div className="gym-card-avatar">
                    {gym.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="gym-card-header-info">
                    <h3 className="gym-card-name">{gym.name}</h3>
                    <p className="gym-card-location">
                      {gym.city}{gym.country ? `, ${gym.country}` : ''}
                    </p>
                  </div>
                  {isNearby && <span className="gym-nearby-badge">Near You</span>}
                </div>

                {gym.address && (
                  <p className="gym-card-address">{gym.address}</p>
                )}

                {gym.description && (
                  <p className="gym-card-desc">{gym.description}</p>
                )}

                {(gym.phone || gym.website) && (
                  <div className="gym-card-links">
                    {gym.phone && (
                      <a href={`tel:${gym.phone}`} className="gym-card-link">
                        <PhoneIcon /> {gym.phone}
                      </a>
                    )}
                    {gym.website && (
                      <a href={gym.website} target="_blank" rel="noopener noreferrer" className="gym-card-link">
                        <GlobeIcon /> Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
