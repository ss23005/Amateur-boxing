import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const ROLE_LABEL = { fighter: 'Amateur Fighter', coach: 'Boxing Coach', fan: 'Fan' }

export default function UserPublicProfile() {
  const { username } = useParams()
  const { user: me } = useAuth()

  const [profile, setProfile]             = useState(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [following, setFollowing]         = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwnProfile = me && String(me.username) === username

  useEffect(() => {
    setLoading(true)
    api.get(`/users/${username}/profile`)
      .then(({ data }) => { setProfile(data); setLoading(false) })
      .catch(() => { setError('User not found'); setLoading(false) })
  }, [username])

  useEffect(() => {
    if (!me || isOwnProfile || !profile) return
    api.get(`/users/${profile._id}/follow-status`)
      .then(({ data }) => setFollowing(data.following))
      .catch(() => {})
  }, [profile, me, isOwnProfile])

  const handleFollow = async () => {
    if (!me || followLoading || !profile?._id) return
    setFollowLoading(true)
    try {
      if (following) {
        await api.post(`/users/${profile._id}/unfollow`)
        setFollowing(false)
      } else {
        await api.post(`/users/${profile._id}/follow`)
        setFollowing(true)
      }
    } catch {}
    finally { setFollowLoading(false) }
  }

  if (loading) return <div className="br-shell"><div className="loading-state">Loading profile…</div></div>

  if (error || !profile) return (
    <div className="br-shell">
      <div style={{ padding: 40 }}><div className="error-banner">{error ?? 'User not found'}</div></div>
    </div>
  )

  // gymId is populated: { _id, name, logo, brandColor } or null
  const gym = profile.gymId && typeof profile.gymId === 'object' ? profile.gymId : null
  const clubColor  = gym?.brandColor || null
  const accentColor = clubColor || null

  const isFighter = profile.role === 'fighter'
  const wins   = profile.record?.wins   ?? 0
  const losses = profile.record?.losses ?? 0
  const draws  = profile.record?.draws  ?? 0
  const bouts  = wins + losses + draws
  const winPct = bouts > 0 ? Math.round((wins / bouts) * 100) : null

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const gymCell = profile.gym && (
    gym ? (
      <Link
        to={`/gyms/${gym.slug || gym._id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: accentColor || 'var(--accent)' }}
      >
        {gym.logo && (
          <img
            src={gym.logo}
            alt={gym.name}
            style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 3, flexShrink: 0 }}
          />
        )}
        {profile.gym}
      </Link>
    ) : profile.gym
  )

  const midStats = [
    isFighter && profile.weightClass && { label: 'weight class', value: profile.weightClass },
    isFighter && bouts > 0           && { label: 'bouts',        value: bouts },
    isFighter && winPct !== null     && { label: 'win %',        value: `${winPct}%` },
    profile.location                 && { label: 'location',     value: profile.location },
    profile.gym                      && { label: 'gym',          value: gymCell },
    { label: 'followers',  value: profile.followers?.length ?? 0 },
    { label: 'following',  value: profile.following?.length ?? 0 },
  ].filter(Boolean)

  const rightDetails = [
    profile.username                                   && { label: 'username',    value: `@${profile.username}` },
    profile.age                                        && { label: 'age',         value: `${profile.age} yrs` },
    isFighter && profile.gender                        && { label: 'division',    value: profile.gender === 'male' ? "Men's" : "Women's" },
    isFighter && profile.stats?.nationality            && { label: 'nationality', value: profile.stats.nationality },
    isFighter && profile.stats?.stance                 && { label: 'stance',      value: profile.stats.stance },
    isFighter && profile.stats?.height                 && { label: 'height',      value: profile.stats.height },
    isFighter && profile.stats?.reach                  && { label: 'reach',       value: profile.stats.reach },
  ].filter(Boolean)

  return (
    <div className="br-shell">

      {/* Club brand stripe */}
      {accentColor && <div style={{ height: 5, background: accentColor }} />}

      {/* Simple topbar back link */}
      <div className="fp2-pub-topbar">
        <Link to="/discover" className="back-link" style={{ color: 'var(--text-3)' }}>← Discover</Link>
      </div>

      <div className="page fp2-page fp2-pub-page">

        {/* Club logo banner (if fighter has a gym with a logo) */}
        {gym?.logo && (
          <div className="fighter-club-banner" style={{ borderColor: accentColor ? `${accentColor}40` : undefined }}>
            <img src={gym.logo} alt={gym.name} className="fighter-club-banner-logo" />
            <Link to={`/gyms/${gym.slug || gym._id}`} className="fighter-club-banner-name" style={{ color: accentColor || 'var(--navy)' }}>
              {gym.name}
            </Link>
          </div>
        )}

        {/* ── Name header ── */}
        <div className="fp2-header" style={accentColor ? { borderBottomColor: `${accentColor}40` } : {}}>
          <div className="fp2-avatar fp2-avatar--top" style={accentColor ? { background: accentColor } : {}}>{initials}</div>
          <h1 className="fp2-name">{profile.name}</h1>
          <p className="fp2-division">
            {ROLE_LABEL[profile.role] ?? 'Member'}
            {isFighter && profile.weightClass && ` · ${profile.weightClass} Division`}
          </p>
          {profile.username && (
            <p className="fp2-username-sub">@{profile.username}</p>
          )}
        </div>

        {/* ── Main 3-column layout ── */}
        <div className="fp2-layout">

          {/* LEFT: Record boxes + avatar + follow */}
          <div className="fp2-left">
            {isFighter && (
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
            )}

            <div className="fp2-avatar fp2-avatar--side" style={accentColor ? { background: accentColor } : {}}>{initials}</div>

            {me && !isOwnProfile && (
              <button
                className={`btn btn-sm ${following ? 'btn-outline' : ''} fp2-follow-btn`}
                style={!following && accentColor ? { background: accentColor, borderColor: accentColor, color: '#fff' } : {}}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {following ? 'Following' : '+ Follow'}
              </button>
            )}
          </div>

          {/* MIDDLE: Stats */}
          <div className="fp2-mid">
            <h3 className="fp2-section-head" style={accentColor ? { color: accentColor } : {}}>
              {isFighter ? 'Career Stats' : 'Profile'}
            </h3>
            {midStats.length > 0 ? (
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
            ) : (
              <p className="fp2-empty">No stats on record.</p>
            )}
          </div>

          {/* RIGHT: Fighter info */}
          <div className="fp2-right">
            <h3 className="fp2-section-head" style={accentColor ? { color: accentColor } : {}}>Fighter Info</h3>
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
      </div>
    </div>
  )
}
