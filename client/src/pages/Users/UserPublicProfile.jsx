import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const ROLE_LABEL = { fighter: 'Amateur Fighter', coach: 'Boxing Coach', fan: 'Fan' }

export default function UserPublicProfile() {
  const { id } = useParams()
  const { user: me } = useAuth()

  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwnProfile = me && String(me._id) === id

  useEffect(() => {
    setLoading(true)
    api.get(`/users/${id}/profile`)
      .then(({ data }) => { setProfile(data); setLoading(false) })
      .catch(() => { setError('User not found'); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!me || isOwnProfile || !profile) return
    api.get(`/users/${id}/follow-status`)
      .then(({ data }) => setFollowing(data.following))
      .catch(() => {})
  }, [id, me, isOwnProfile, profile])

  const handleFollow = async () => {
    if (!me || followLoading) return
    setFollowLoading(true)
    try {
      if (following) {
        await api.post(`/users/${id}/unfollow`)
        setFollowing(false)
      } else {
        await api.post(`/users/${id}/follow`)
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

  const isFighter = profile.role === 'fighter'
  const wins   = profile.record?.wins   ?? 0
  const losses = profile.record?.losses ?? 0
  const draws  = profile.record?.draws  ?? 0
  const total  = wins + losses + draws
  const initial = (profile.name ?? '?').charAt(0).toUpperCase()

  const detailRows = [
    isFighter && profile.gender     && { label: 'Division',     value: profile.gender === 'male' ? "Men's" : "Women's" },
    isFighter && profile.weightClass && { label: 'Weight Class', value: profile.weightClass },
    profile.age                     && { label: 'Age',           value: `${profile.age} yrs` },
    profile.location                && { label: 'Location',      value: profile.location },
    profile.gym                     && { label: 'Gym',           value: profile.gym },
  ].filter(Boolean)

  return (
    <div className="br-shell">

      {/* ── Banner ── */}
      <div className="br-banner">
        <div className="br-banner-inner">
          <div className="br-avatar">{initial}</div>

          <div className="br-identity">
            <div className="br-name">{profile.name}</div>
            {profile.username && (
              <div className="br-username">@{profile.username}</div>
            )}
            <div className="br-role">{ROLE_LABEL[profile.role] ?? 'Member'}</div>
            {isFighter && profile.weightClass && (
              <div className="br-weight-badge">{profile.weightClass}</div>
            )}
          </div>

          {me && !isOwnProfile && (
            <button
              className={`br-follow-btn${following ? ' br-follow-btn--active' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? 'Following' : '+ Follow'}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="br-body">

        {/* Left column */}
        <div className="br-left">

          {/* Record card */}
          {isFighter && (
            <div className="br-card">
              <div className="br-card-title">Record</div>
              <div className="br-record-grid">
                <div className="br-record-cell">
                  <div className="br-record-num br-record-num--w">{wins}</div>
                  <div className="br-record-label">Wins</div>
                </div>
                <div className="br-record-divider" />
                <div className="br-record-cell">
                  <div className="br-record-num br-record-num--l">{losses}</div>
                  <div className="br-record-label">Losses</div>
                </div>
                <div className="br-record-divider" />
                <div className="br-record-cell">
                  <div className="br-record-num br-record-num--d">{draws}</div>
                  <div className="br-record-label">Draws</div>
                </div>
              </div>
              {total > 0 && (
                <div className="br-win-pct">
                  {Math.round((wins / total) * 100)}% win rate · {total} bout{total !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Social card */}
          <div className="br-card">
            <div className="br-card-title">Community</div>
            <div className="br-social-row">
              <div className="br-social-cell">
                <div className="br-social-num">{profile.followers?.length ?? 0}</div>
                <div className="br-social-label">Followers</div>
              </div>
              <div className="br-record-divider" />
              <div className="br-social-cell">
                <div className="br-social-num">{profile.following?.length ?? 0}</div>
                <div className="br-social-label">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column – profile info */}
        <div className="br-right">
          <div className="br-card">
            <div className="br-card-title">Profile</div>
            {detailRows.length > 0 ? (
              <table className="br-info-table">
                <tbody>
                  {detailRows.map(row => (
                    <tr key={row.label} className="br-info-row">
                      <td className="br-info-label">{row.label}</td>
                      <td className="br-info-value">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-4)', fontSize: 13, margin: 0 }}>No profile details yet.</p>
            )}
          </div>

          {!isFighter && (
            <div className="br-card br-fan-note">
              <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {profile.role === 'coach'
                  ? 'This member is a boxing coach.'
                  : 'This member follows amateur boxing.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
