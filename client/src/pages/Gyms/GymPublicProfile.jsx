import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function MemberCard({ member, clubColor }) {
  const initial   = (member.name ?? '?').charAt(0).toUpperCase()
  const isFighter = member.role === 'fighter'
  const wins      = member.record?.wins   ?? 0
  const losses    = member.record?.losses ?? 0
  const draws     = member.record?.draws  ?? 0

  return (
    <Link to={`/users/${member.username}`} className="user-card">
      <div className="user-card-avatar" style={clubColor ? { background: clubColor } : {}}>
        {initial}
      </div>
      <div className="user-card-name">{member.name}</div>
      {member.username && <div className="user-card-username">@{member.username}</div>}
      <span
        className="user-card-role-badge"
        style={
          clubColor
            ? { background: `${clubColor}18`, color: clubColor }
            : isFighter
              ? { background: 'rgba(232,25,44,0.10)', color: '#c0101f' }
              : { background: 'rgba(10,36,99,0.10)',  color: '#0a2463' }
        }
      >
        {isFighter ? 'Fighter' : 'Gym'}
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
          {member.weightClass && <div className="user-card-weight">{member.weightClass}</div>}
        </>
      )}
      {member.location && (
        <div className="user-card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {member.location}
        </div>
      )}
    </Link>
  )
}

export default function GymPublicProfile() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [gym,        setGym]        = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [joinStatus, setJoinStatus] = useState(null) // null | 'pending' | 'approved'
  const [joining,    setJoining]    = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/gyms/${slug}`)
      .then(({ data }) => {
        setGym(data)
        setLoading(false)
        // Set initial join status from current user context
        if (user && user.gymId && String(user.gymId) === String(data._id)) {
          setJoinStatus(user.gymJoinStatus || 'pending')
        }
      })
      .catch(() => { setError('Gym not found'); setLoading(false) })
  }, [slug, user])

  const handleRequestJoin = async () => {
    setJoining(true)
    try {
      await api.post(`/gyms/${gym._id}/join`)
      setJoinStatus('pending')
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Could not send request.')
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <div className="br-shell"><div className="loading-state">Loading gym…</div></div>

  if (error || !gym) return (
    <div className="br-shell">
      <div style={{ padding: 40 }}><div className="error-banner">{error ?? 'Gym not found'}</div></div>
    </div>
  )

  const fighters   = gym.fighters ?? []
  const coaches    = gym.coaches  ?? []
  const gallery    = gym.gallery  ?? []
  const initial    = gym.name.charAt(0).toUpperCase()
  const clubColor  = gym.brandColor || null
  const accentColor = clubColor || '#0a2463'

  const isFighter    = user?.role === 'fighter'
  const isGymOwner   = user?.role === 'gym' && user?.gymId && String(user.gymId) === String(gym._id)
  const alreadyMember = joinStatus === 'approved' || (user?.gymId && String(user.gymId) === String(gym._id) && joinStatus === 'approved')
  const isPending    = joinStatus === 'pending'
  const canRequest   = isFighter && !alreadyMember && !isPending && (!user?.gymId || String(user.gymId) !== String(gym._id))

  return (
    <div className="br-shell">

      {/* Brand colour stripe */}
      <div style={{ height: 5, background: accentColor }} />

      <div className="fp2-pub-topbar">
        <Link to="/discover" className="back-link" style={{ color: 'var(--text-3)' }}>← Discover</Link>
        {isGymOwner && (
          <Link to="/account" style={{ fontSize: 13, color: accentColor, fontWeight: 600, textDecoration: 'none' }}>
            Manage Gym →
          </Link>
        )}
      </div>

      <div className="page fp2-page fp2-pub-page">

        {/* Header */}
        <div className="fp2-header">
          <div className="gym-profile-logo-wrap">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="gym-profile-logo-img" />
            ) : (
              <div className="gym-profile-logo-initial" style={{ background: accentColor }}>
                {initial}
              </div>
            )}
          </div>

          <h1 className="fp2-name">{gym.name}</h1>
          {(gym.city || gym.country) && (
            <p className="fp2-division">
              {[gym.city, gym.postcode, gym.country].filter(Boolean).join(', ')}
            </p>
          )}
          {gym.address && (
            <p className="fp2-username-sub">{gym.address}</p>
          )}

          {/* Request to Join */}
          {canRequest && (
            <button
              onClick={handleRequestJoin}
              disabled={joining}
              style={{ marginTop: 16, padding: '10px 24px', background: accentColor, color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}
            >
              {joining ? 'Sending…' : 'Request to Join'}
            </button>
          )}
          {isPending && (
            <div style={{ marginTop: 16, padding: '10px 20px', background: 'rgba(10,36,99,0.08)', borderRadius: 8, fontSize: 13, color: '#0a2463', fontWeight: 600 }}>
              Join request pending — waiting for gym approval
            </div>
          )}

          {/* Stat pills */}
          <div className="gym-profile-stats-row">
            <div className="gym-profile-stat" style={{ borderColor: accentColor }}>
              <span className="gym-profile-stat-num" style={{ color: accentColor }}>{fighters.length}</span>
              <span className="gym-profile-stat-label">Fighters</span>
            </div>
            <div className="gym-profile-stat" style={{ borderColor: accentColor }}>
              <span className="gym-profile-stat-num" style={{ color: accentColor }}>{coaches.length}</span>
              <span className="gym-profile-stat-label">Staff</span>
            </div>
          </div>
        </div>

        {/* Gym meta */}
        {(gym.description || gym.phone || gym.website || gym.email) && (
          <div className="fp2-layout" style={{ marginBottom: 0 }}>
            <div className="fp2-mid" style={{ gridColumn: '1 / -1' }}>
              {gym.description && (
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {gym.description}
                </p>
              )}
              <table className="fp2-stats-table">
                <tbody>
                  {gym.phone   && <tr><td className="fp2-stats-label">phone</td><td className="fp2-stats-value"><a href={`tel:${gym.phone}`} style={{ color: accentColor }}>{gym.phone}</a></td></tr>}
                  {gym.website && <tr><td className="fp2-stats-label">website</td><td className="fp2-stats-value"><a href={gym.website} target="_blank" rel="noopener noreferrer" style={{ color: accentColor }}>{gym.website.replace(/^https?:\/\//, '')}</a></td></tr>}
                  {gym.email   && <tr><td className="fp2-stats-label">email</td><td className="fp2-stats-value"><a href={`mailto:${gym.email}`} style={{ color: accentColor }}>{gym.email}</a></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div className="discover-section-header">
              <h2 className="discover-section-title" style={{ color: accentColor }}>Gallery</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginTop: 12 }}>
              {gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${gym.name} photo ${i + 1}`}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active fighters */}
        <div className="discover-section-header" style={{ marginTop: 48 }}>
          <h2 className="discover-section-title" style={{ color: accentColor }}>Active Fighters</h2>
          <span className="discover-section-count">{fighters.length} fighter{fighters.length !== 1 ? 's' : ''}</span>
        </div>

        {fighters.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <p className="empty-state-title">No fighters registered yet</p>
          </div>
        ) : (
          <div className="user-grid">
            {fighters.map(f => <MemberCard key={f._id} member={f} clubColor={clubColor} />)}
          </div>
        )}

        {/* Gym staff */}
        {coaches.length > 0 && (
          <>
            <div className="discover-section-header" style={{ marginTop: 48 }}>
              <h2 className="discover-section-title" style={{ color: accentColor }}>Gym Staff</h2>
              <span className="discover-section-count">{coaches.length} member{coaches.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="user-grid">
              {coaches.map(c => <MemberCard key={c._id} member={c} clubColor={clubColor} />)}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
