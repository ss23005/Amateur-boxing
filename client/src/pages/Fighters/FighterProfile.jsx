import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

export default function FighterProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: fighter, loading, error } = useFetch(`/fighters/${id}`)

  const [following, setFollowing]         = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const isOwnProfile = String(user?._id) === String(fighter?.user?._id)

  useEffect(() => {
    if (!user || !fighter || isOwnProfile) return
    api.get(`/users/${fighter.user?._id}/follow-status`)
      .then(({ data }) => setFollowing(data.following))
      .catch(() => {})
  }, [fighter, user, isOwnProfile])

  const handleFollow = async () => {
    if (!user || followLoading || !fighter?.user?._id) return
    setFollowLoading(true)
    try {
      const uid = fighter.user._id
      if (following) {
        await api.post(`/users/${uid}/unfollow`)
        setFollowing(false)
      } else {
        await api.post(`/users/${uid}/follow`)
        setFollowing(true)
      }
    } catch (err) {
      console.error('Follow failed', err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) return <div className="loading-state">Loading fighter…</div>
  if (error)   return <div className="page"><div className="error-banner">Error: {error}</div></div>
  if (!fighter) return null

  const wins   = fighter.record?.wins   ?? 0
  const losses = fighter.record?.losses ?? 0
  const draws  = fighter.record?.draws  ?? 0
  const bouts  = wins + losses + draws
  const winPct = bouts > 0 ? Math.round((wins / bouts) * 100) : null

  const initials = fighter.name
    ? fighter.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const rightDetails = [
    { label: 'username',    value: fighter.user?.username ? `@${fighter.user.username}` : null },
    { label: 'age',         value: fighter.stats?.age         ?? null },
    { label: 'nationality', value: fighter.stats?.nationality ?? null },
    { label: 'stance',      value: fighter.stats?.stance      ?? null },
    { label: 'height',      value: fighter.stats?.height      ?? null },
    { label: 'reach',       value: fighter.stats?.reach       ?? null },
  ].filter(r => r.value !== null && r.value !== '')

  const midStats = [
    { label: 'weight class', value: fighter.weightClass || '—' },
    { label: 'bouts',        value: bouts > 0 ? bouts   : '—' },
    { label: 'win %',        value: winPct !== null ? `${winPct}%` : '—' },
    { label: 'location',     value: fighter.location    || '—' },
  ]

  return (
    <div className="page fp2-page">
      <Link to="/fighters" className="back-link">← Fighters</Link>

      {/* ── Name header ── */}
      <div className="fp2-header">
        <div className="fp2-avatar fp2-avatar--top">{initials}</div>
        <h1 className="fp2-name">{fighter.name}</h1>
        {fighter.weightClass && (
          <p className="fp2-division">{fighter.weightClass} Division · Amateur Fighter</p>
        )}
      </div>

      {/* ── Main 3-column layout ── */}
      <div className="fp2-layout">

        {/* LEFT: Record boxes + avatar + follow */}
        <div className="fp2-left">
          <div className="fp2-record">
            <div className="fp2-rbox fp2-rbox--w">
              <span className="fp2-rbox-num">{wins}</span>
              <span className="fp2-rbox-label">Wins</span>
            </div>
            <div className="fp2-rbox fp2-rbox--l">
              <span className="fp2-rbox-num">{losses}</span>
              <span className="fp2-rbox-label">Losses</span>
            </div>
            <div className="fp2-rbox fp2-rbox--d">
              <span className="fp2-rbox-num">{draws}</span>
              <span className="fp2-rbox-label">Draws</span>
            </div>
          </div>

          <div className="fp2-avatar fp2-avatar--side">{initials}</div>

          {user && !isOwnProfile && (
            <button
              className={`btn btn-sm ${following ? 'btn-outline' : 'btn-red'} fp2-follow-btn`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? 'Following' : '+ Follow'}
            </button>
          )}
          {isOwnProfile && (
            <Link to="/profile" className="btn btn-sm btn-outline fp2-follow-btn">
              Edit Profile
            </Link>
          )}
        </div>

        {/* MIDDLE: Career stats */}
        <div className="fp2-mid">
          <h3 className="fp2-section-head">Career Stats</h3>
          <table className="fp2-stats-table">
            <tbody>
              {midStats.map(row => (
                <tr key={row.label}>
                  <td className="fp2-stats-label">{row.label}</td>
                  <td className="fp2-stats-value">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Fighter info */}
        <div className="fp2-right">
          <h3 className="fp2-section-head">Fighter Info</h3>
          {rightDetails.length > 0 ? (
            <table className="fp2-stats-table">
              <tbody>
                {rightDetails.map(row => (
                  <tr key={row.label}>
                    <td className="fp2-stats-label">{row.label}</td>
                    <td className="fp2-stats-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="fp2-empty">No additional info on record.</p>
          )}
        </div>

      </div>

      {/* ── Bio ── */}
      {fighter.bio && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="section-title">About</h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.72, margin: 0 }}>{fighter.bio}</p>
        </div>
      )}
    </div>
  )
}
