import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'

const MENS_WEIGHT_CLASSES = [
  'Minimumweight', 'Flyweight', 'Bantamweight', 'Lightweight',
  'Light Welterweight', 'Welterweight', 'Middleweight',
  'Light Heavyweight', 'Heavyweight', 'Super Heavyweight',
]

const WOMENS_WEIGHT_CLASSES = [
  'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
  'Light Middleweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight',
]

const ALL_WEIGHT_CLASSES = [...new Set([...MENS_WEIGHT_CLASSES, ...WOMENS_WEIGHT_CLASSES])]

const STANCES = ['Orthodox', 'Southpaw', 'Switch']

const SORTS = [
  { value: 'wins',   label: 'Most Wins' },
  { value: 'record', label: 'Best Record %' },
  { value: 'name',   label: 'Name A–Z' },
  { value: 'newest', label: 'Newest' },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="filter-search-icon">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

function XIcon({ size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}

export default function FighterList() {
  const { data: fighters, loading, error } = useFetch('/fighters')
  const { user } = useAuth()

  const [search,      setSearch]      = useState('')
  const [gender,      setGender]      = useState('')
  const [weightClass, setWeightClass] = useState('')
  const [stance,      setStance]      = useState('')
  const [sort,        setSort]        = useState('wins')

  const activeFilterCount = [search, gender, weightClass, stance].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setGender('')
    setWeightClass('')
    setStance('')
  }

  const weightClassOptions = gender === 'male'
    ? MENS_WEIGHT_CLASSES
    : gender === 'female'
    ? WOMENS_WEIGHT_CLASSES
    : ALL_WEIGHT_CLASSES

  const filtered = useMemo(() => {
    if (!fighters) return []
    let results = [...fighters]

    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.stats?.nationality?.toLowerCase().includes(q) ||
        f.weightClass?.toLowerCase().includes(q)
      )
    }

    if (gender)      results = results.filter(f => f.gender === gender)
    if (weightClass) results = results.filter(f => f.weightClass === weightClass)
    if (stance)      results = results.filter(f =>
      f.stats?.stance?.toLowerCase() === stance.toLowerCase()
    )

    const pct = f => {
      const total = (f.record?.wins ?? 0) + (f.record?.losses ?? 0) + (f.record?.draws ?? 0)
      return total > 0 ? (f.record?.wins ?? 0) / total : 0
    }

    if (sort === 'wins') {
      results.sort((a, b) => (b.record?.wins ?? 0) - (a.record?.wins ?? 0))
    } else if (sort === 'record') {
      results.sort((a, b) => pct(b) - pct(a))
    } else if (sort === 'newest') {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else {
      results.sort((a, b) => a.name.localeCompare(b.name))
    }

    return results
  }, [fighters, search, gender, weightClass, stance, sort])

  if (loading) return <div className="loading-state">Loading fighters...</div>
  if (error)   return (
    <div className="page"><div className="error-banner">Error: {error}</div></div>
  )

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="page-header" data-tutorial="fighters-main">
        <div>
          <p className="page-eyebrow">Rankings</p>
          <h1 className="page-title">Leaderboard</h1>
          <p className="fighters-subtitle">
            {fighters?.length ?? 0} registered fighters
          </p>
        </div>
        {activeFilterCount > 0 && (
          <span className="page-count">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="filter-search-wrap">
          <SearchIcon />
          <input
            className="filter-search-input"
            type="text"
            placeholder="Search by name, nationality..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="filter-search-clear" onClick={() => setSearch('')}>
              <XIcon size={13} />
            </button>
          )}
        </div>

        <select className="filter-select" value={gender} onChange={e => { setGender(e.target.value); setWeightClass('') }}>
          <option value="">All Divisions</option>
          <option value="male">Men&apos;s</option>
          <option value="female">Women&apos;s</option>
        </select>

        <select className="filter-select" value={weightClass} onChange={e => setWeightClass(e.target.value)}>
          <option value="">All Weight Classes</option>
          {weightClassOptions.map(w => <option key={w} value={w}>{w}</option>)}
        </select>

        <select className="filter-select" value={stance} onChange={e => setStance(e.target.value)}>
          <option value="">All Stances</option>
          {STANCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {activeFilterCount > 0 && (
          <button className="filter-clear-btn" onClick={clearFilters}>
            <XIcon size={13} /> Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ''}
          </button>
        )}
      </div>

      {/* ── Active chips ── */}
      {activeFilterCount > 0 && (
        <div className="filter-chips">
          {gender && (
            <button className="filter-chip" onClick={() => { setGender(''); setWeightClass('') }}>
              {gender === 'male' ? "Men's" : "Women's"} <XIcon size={11} />
            </button>
          )}
          {weightClass && (
            <button className="filter-chip" onClick={() => setWeightClass('')}>
              {weightClass} <XIcon size={11} />
            </button>
          )}
          {stance && (
            <button className="filter-chip" onClick={() => setStance('')}>
              {stance} <XIcon size={11} />
            </button>
          )}
        </div>
      )}

      {/* ── Fighter list ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No fighters found</p>
          <p className="empty-state-desc">
            {activeFilterCount > 0
              ? 'Try adjusting or clearing your filters.'
              : 'No fighters have been registered yet.'}
          </p>
          {activeFilterCount > 0 && (
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="fighter-list-wrap">
          {/* Column headers */}
          <div className="fighter-list-header">
            <span className="fl-col-rank">#</span>
            <span className="fl-col-name">Fighter</span>
            <span className="fl-col-class">Weight Class</span>
            <span className="fl-col-stat">W</span>
            <span className="fl-col-stat">L</span>
            <span className="fl-col-stat">D</span>
            <span className="fl-col-location">Location</span>
          </div>

          {filtered.map((f, index) => {
            const { wins = 0, losses = 0, draws = 0 } = f.record ?? {}
            const initial  = f.name.charAt(0).toUpperCase()
            const rank     = index + 1
            const location = f.location || f.user?.location || f.stats?.nationality || '—'
            const isYou    = user && f.user && (
              f.user._id === user._id || f.user._id?.toString() === user._id?.toString()
            )

            return (
              <Link
                key={f._id}
                to={`/fighters/${f._id}`}
                className={`fighter-list-row${isYou ? ' is-you' : ''}`}
              >
                <span className={`fl-col-rank fl-rank-num${rank <= 3 ? ' top-three' : ''}`}>
                  #{rank}
                </span>

                <span className="fl-col-name fl-name-cell">
                  <span className="fl-avatar">{initial}</span>
                  <span className="fl-name-text">
                    <span className="fl-name">{f.name}</span>
                    {isYou && <span className="fl-you-tag">YOU</span>}
                  </span>
                </span>

                <span className="fl-col-class">
                  <span className="badge badge-blue">{f.weightClass || '—'}</span>
                </span>

                <span className="fl-col-stat fl-stat-w">{wins}</span>
                <span className="fl-col-stat fl-stat-l">{losses}</span>
                <span className="fl-col-stat fl-stat-d">{draws}</span>

                <span className="fl-col-location fl-location">{location}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
