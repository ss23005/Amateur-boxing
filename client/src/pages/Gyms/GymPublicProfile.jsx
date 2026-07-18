import { useState, useEffect, useRef } from 'react'
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
  const logoInputRef    = useRef(null)
  const galleryInputRef = useRef(null)

  const [gym,        setGym]        = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [joinStatus, setJoinStatus] = useState(null)
  const [joining,    setJoining]    = useState(false)

  // Edit mode
  const [isEditing,  setIsEditing]  = useState(false)
  const [editForm,   setEditForm]   = useState({})
  const [logoPreview, setLogoPreview] = useState('')
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/gyms/${slug}`)
      .then(({ data }) => {
        setGym(data)
        setLoading(false)
        if (user && user.gymId && String(user.gymId) === String(data._id)) {
          setJoinStatus(user.gymJoinStatus ?? '')
        }
      })
      .catch(() => { setError('Gym not found'); setLoading(false) })
  }, [slug, user])

  const startEditing = () => {
    setEditForm({
      name:        gym.name        ?? '',
      address:     gym.address     ?? '',
      city:        gym.city        ?? '',
      postcode:    gym.postcode    ?? '',
      country:     gym.country     ?? '',
      phone:       gym.phone       ?? '',
      website:     gym.website     ?? '',
      email:       gym.email       ?? '',
      description: gym.description ?? '',
      brandColor:  gym.brandColor  ?? '#0a2463',
      logo:        gym.logo        ?? '',
      gallery:     gym.gallery     ?? [],
    })
    setLogoPreview(gym.logo ?? '')
    setGalleryPreviews(gym.gallery ?? [])
    setSaveError('')
    setIsEditing(true)
  }

  const cancelEditing = () => { setIsEditing(false); setSaveError('') }

  const set = field => e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleLogoChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setLogoPreview(ev.target.result)
      setEditForm(prev => ({ ...prev, logo: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview('')
    setEditForm(prev => ({ ...prev, logo: '' }))
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const handleGalleryAdd = e => {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - galleryPreviews.length)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target.result
        setGalleryPreviews(prev => [...prev, url].slice(0, 6))
        setEditForm(prev => ({ ...prev, gallery: [...prev.gallery, url].slice(0, 6) }))
      }
      reader.readAsDataURL(file)
    })
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const removeGalleryImage = index => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    setEditForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }))
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!editForm.name?.trim()) { setSaveError('Gym name is required.'); return }
    setSaving(true)
    setSaveError('')
    try {
      const { data } = await api.put(`/gyms/${gym._id}`, editForm)
      setGym(prev => ({ ...prev, ...data }))
      setIsEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message ?? 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

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

  const fighters    = gym.fighters ?? []
  const coaches     = gym.coaches  ?? []
  const gallery     = gym.gallery  ?? []
  const initial     = gym.name.charAt(0).toUpperCase()
  const clubColor   = gym.brandColor || null
  const accentColor = clubColor || '#0a2463'

  const isFighter   = user?.role === 'fighter'
  const isGymOwner  = user?.role === 'gym' && user?.gymId && String(user.gymId) === String(gym._id)
  const isPending   = joinStatus === 'pending'
  const canRequest  = isFighter && !isPending && joinStatus !== 'approved' && (!user?.gymId || String(user.gymId) !== String(gym._id))

  return (
    <div className="br-shell">
      <div style={{ height: 5, background: accentColor }} />

      <div className="fp2-pub-topbar">
        <Link to="/discover" className="back-link" style={{ color: 'var(--text-3)' }}>← Discover</Link>
        {isGymOwner && !isEditing && (
          <button
            onClick={startEditing}
            style={{ marginLeft: 16, fontSize: 13, color: accentColor, fontWeight: 600, background: 'none', border: `1px solid ${accentColor}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
          >
            Manage Gym
          </button>
        )}
        {isGymOwner && isEditing && (
          <button
            onClick={cancelEditing}
            style={{ marginLeft: 16, fontSize: 13, color: 'var(--text-3)', fontWeight: 600, background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* ── Edit mode ── */}
      {isEditing && (
        <div className="page fp2-page fp2-pub-page">
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--navy)', marginBottom: 24 }}>Edit Gym</h2>
          <form onSubmit={handleSave}>

            {/* Logo */}
            <div className="form-group">
              <label className="form-label">Club Logo</label>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              {logoPreview ? (
                <div className="logo-upload-preview">
                  <img src={logoPreview} alt="Logo preview" className="logo-upload-img" />
                  <button type="button" className="logo-upload-remove" onClick={removeLogo}>✕ Remove</button>
                </div>
              ) : (
                <button type="button" className="logo-upload-btn" onClick={() => logoInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, marginBottom: 6 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>Upload Logo</span>
                  <span style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>PNG, JPG or SVG</span>
                </button>
              )}
            </div>

            {/* Brand colour */}
            <div className="form-group">
              <label className="form-label">Brand Colour</label>
              <div className="color-picker-row">
                <input type="color" className="color-picker-swatch" value={editForm.brandColor || '#0a2463'} onChange={set('brandColor')} />
                <input type="text" className="input color-picker-hex" value={editForm.brandColor || '#0a2463'}
                  onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setEditForm(p => ({ ...p, brandColor: v })) }}
                  maxLength={7} spellCheck={false}
                />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Hex colour</span>
              </div>
            </div>

            {/* Gallery */}
            <div className="form-group">
              <label className="form-label">Gallery <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(up to 6 photos)</span></label>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryAdd} />
              {galleryPreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
                  {galleryPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} alt={`Gallery ${i + 1}`} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8 }} />
                      <button type="button" onClick={() => removeGalleryImage(i)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              {galleryPreviews.length < 6 && (
                <button type="button" className="logo-upload-btn" onClick={() => galleryInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, marginBottom: 4 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Add Photos</span>
                  <span style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{galleryPreviews.length}/6 added</span>
                </button>
              )}
            </div>

            {/* Details */}
            <div className="gym-edit-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Club Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input className="input" value={editForm.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="input" value={editForm.address} onChange={set('address')} placeholder="e.g. 14 Broad Street" />
              </div>
              <div className="form-group">
                <label className="form-label">Town / City</label>
                <input className="input" value={editForm.city} onChange={set('city')} placeholder="e.g. Manchester" />
              </div>
              <div className="form-group">
                <label className="form-label">Postcode</label>
                <input className="input" value={editForm.postcode} onChange={set('postcode')} placeholder="e.g. M1 1AA" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="input" value={editForm.country} onChange={set('country')} placeholder="e.g. England" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="input" type="tel" value={editForm.phone} onChange={set('phone')} placeholder="e.g. 0161 555 0100" />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="input" type="url" value={editForm.website} onChange={set('website')} placeholder="https://yourgym.com" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Email</label>
                <input className="input" type="email" value={editForm.email} onChange={set('email')} placeholder="info@yourgym.com" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">About the Club</label>
                <textarea className="input textarea" rows={4} value={editForm.description} onChange={set('description')} placeholder="Tell fighters about your club…" />
              </div>
            </div>

            {saveError && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: 8 }}>{saveError}</p>}

            <div className="account-edit-actions" style={{ marginTop: 24 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-outline" onClick={cancelEditing} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── View mode ── */}
      {!isEditing && (
        <div className="page fp2-page fp2-pub-page">

          {/* Header */}
          <div className="fp2-header">
            <div className="gym-profile-logo-wrap">
              {gym.logo ? (
                <img src={gym.logo} alt={gym.name} className="gym-profile-logo-img" />
              ) : (
                <div className="gym-profile-logo-initial" style={{ background: accentColor }}>{initial}</div>
              )}
            </div>
            <h1 className="fp2-name">{gym.name}</h1>
            {(gym.city || gym.country) && (
              <p className="fp2-division">{[gym.city, gym.postcode, gym.country].filter(Boolean).join(', ')}</p>
            )}
            {gym.address && <p className="fp2-username-sub">{gym.address}</p>}

            {canRequest && (
              <button
                onClick={handleRequestJoin}
                disabled={joining}
                style={{ marginTop: 16, padding: '10px 24px', background: accentColor, color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}
              >
                {joining ? 'Sending…' : 'Request to Join'}
              </button>
            )}
            {isPending && isFighter && (
              <div style={{ marginTop: 16, padding: '10px 20px', background: 'rgba(10,36,99,0.08)', borderRadius: 8, fontSize: 13, color: '#0a2463', fontWeight: 600 }}>
                Join request pending — waiting for gym approval
              </div>
            )}

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
                  <img key={i} src={img} alt={`${gym.name} photo ${i + 1}`} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
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
      )}
    </div>
  )
}
