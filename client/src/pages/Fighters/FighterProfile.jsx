import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

export default function FighterProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: fighter, loading, error } = useFetch(`/fighters/${id}`)

  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const isOwnProfile = String(user?._id) === id

  useEffect(() => {
    if (!user || isOwnProfile) return
    api.get(`/users/${id}/follow-status`)
      .then(({ data }) => setFollowing(data.following))
      .catch(() => {})
  }, [id, user, isOwnProfile])

  const handleFollow = async () => {
    if (!user || followLoading) return
    setFollowLoading(true)
    try {
      if (following) {
        await api.post(`/users/${id}/unfollow`)
        setFollowing(false)
      } else {
        await api.post(`/users/${id}/follow`)
        setFollowing(true)
      }
    } catch (err) {
      console.error('Follow failed', err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) return <div className="loading-state">Loading fighter...</div>
  if (error) return (
    <div className="page">
      <div className="error-banner">Error: {error}</div>
    </div>
  )
  if (!fighter) return null

  const { record } = fighter

  return (
    <div className="page">
      <Link to="/fighters" className="back-link">← Back to Fighters</Link>

      <div className="profile-hero">
        <div className="profile-hero-top">
          <div className="profile-avatar">{fighter.name.charAt(0)}</div>
          <div className="profile-meta">
            <span className="badge badge-blue">{fighter.weightClass || 'Unclassified'}</span>
            <h1 className="profile-name">{fighter.name}</h1>
            <p className="page-eyebrow" style={{ margin: '6px 0 0', color: 'var(--text-4)' }}>Amateur Fighter</p>
          </div>
          {user && !isOwnProfile && (
            <button
              className={`btn btn-sm ${following ? 'btn-outline' : 'btn-red'} profile-follow-btn`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-value">{record?.wins ?? 0}</div>
            <div className="stat-label">Wins</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{record?.losses ?? 0}</div>
            <div className="stat-label">Losses</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{record?.draws ?? 0}</div>
            <div className="stat-label">Draws</div>
          </div>
        </div>
      </div>

      {fighter.bio && (
        <div className="card">
          <h2 className="section-title">About</h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.72, margin: 0 }}>{fighter.bio}</p>
        </div>
      )}
    </div>
  )
}
