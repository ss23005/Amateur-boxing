import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const ROLE_LABELS = {
  fan:     'Fan',
  fighter: 'Fighter',
  coach:   'Coach',
  admin:   'Admin',
}

const MENS_WEIGHT_CLASSES = [
  { value: 'Minimumweight',     label: 'Minimumweight (Up to 49 kg / 108 lbs)' },
  { value: 'Flyweight',         label: 'Flyweight (Up to 52 kg / 115 lbs)' },
  { value: 'Bantamweight',      label: 'Bantamweight (Up to 56 kg / 123 lbs)' },
  { value: 'Lightweight',       label: 'Lightweight (Up to 60 kg / 132 lbs)' },
  { value: 'Light Welterweight', label: 'Light Welterweight (Up to 64 kg / 141 lbs)' },
  { value: 'Welterweight',      label: 'Welterweight (Up to 69 kg / 152 lbs)' },
  { value: 'Middleweight',      label: 'Middleweight (Up to 75 kg / 165 lbs)' },
  { value: 'Light Heavyweight', label: 'Light Heavyweight (Up to 81 kg / 178 lbs)' },
  { value: 'Heavyweight',       label: 'Heavyweight (Up to 91 kg / 201 lbs)' },
  { value: 'Super Heavyweight', label: 'Super Heavyweight (Over 91 kg / 201 lbs)' },
]

const WOMENS_WEIGHT_CLASSES = [
  { value: 'Flyweight',          label: 'Flyweight (48–51 kg)' },
  { value: 'Bantamweight',       label: 'Bantamweight (51–54 kg)' },
  { value: 'Featherweight',      label: 'Featherweight (54–57 kg)' },
  { value: 'Lightweight',        label: 'Lightweight (57–60 kg)' },
  { value: 'Light Middleweight', label: 'Light Middleweight (65–70 kg)' },
  { value: 'Middleweight',       label: 'Middleweight (Up to 75 kg)' },
  { value: 'Light Heavyweight',  label: 'Light Heavyweight (Up to 81 kg)' },
  { value: 'Heavyweight',        label: 'Heavyweight (Above 81 kg)' },
]

function Field({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="account-field">
      <span className="account-field-label">{label}</span>
      <span className="account-field-value">{value}</span>
    </div>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function UserRow({ u, followingIds, onFollow, onUnfollow }) {
  const [loading, setLoading] = useState(false)
  const isFollowing = followingIds.has(String(u._id))
  const handle = async () => {
    setLoading(true)
    try { isFollowing ? await onUnfollow(u._id) : await onFollow(u._id) }
    finally { setLoading(false) }
  }
  return (
    <div className="account-user-pill">
      <div className="account-user-pill-avatar">{u.name.charAt(0).toUpperCase()}</div>
      <div className="account-user-pill-info">
        <span className="account-user-pill-name">{u.name}</span>
        <span className="account-user-pill-role">{ROLE_LABELS[u.role] ?? u.role}</span>
      </div>
      <button
        className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-red'}`}
        onClick={handle}
        disabled={loading}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  )
}

function FindPeopleModal({ onClose, followingIds, onFollow, onUnfollow }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (query.trim().length < 2) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`)
        setResults(data)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Find People</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <input
          ref={inputRef}
          className="input"
          style={{ width: '100%', marginBottom: 12 }}
          placeholder="Search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {searching && <p className="account-social-empty">Searching…</p>}
        {!searching && query.length >= 2 && results.length === 0 && (
          <p className="account-social-empty">No users found for "{query}"</p>
        )}
        <div className="account-social-list">
          {results.map(u => (
            <UserRow
              key={u._id}
              u={u}
              followingIds={followingIds}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DeleteAccountModal({ onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('')
  const ready = confirmText === 'DELETE'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box delete-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Account</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="delete-modal-body">
          This will permanently delete your account, profile, and all associated data.
          <strong> This cannot be undone.</strong>
        </p>
        <p className="delete-modal-instruction">
          Type <span className="delete-modal-keyword">DELETE</span> to confirm.
        </p>
        <input
          className="input"
          placeholder="DELETE"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="btn-row" style={{ marginTop: 20 }}>
          <button className="btn btn-outline btn-row-grow" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-danger btn-row-grow"
            onClick={onConfirm}
            disabled={!ready || loading}
          >
            {loading ? 'Deleting…' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Account() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [form,    setForm]    = useState({})

  const [social, setSocial] = useState({ following: [], followers: [] })
  const [showFind, setShowFind] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const [gym,        setGym]        = useState(null)
  const [gymEditing, setGymEditing] = useState(false)
  const [gymForm,    setGymForm]    = useState({})
  const [gymSaving,  setGymSaving]  = useState(false)
  const [gymError,   setGymError]   = useState('')
  const [gymSuccess, setGymSuccess] = useState(false)

  useEffect(() => {
    api.get('/users/me/social').then(({ data }) => setSocial(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`).then(({ data }) => setGym(data)).catch(() => {})
    }
  }, [user?.gymId])

  const followingIds = new Set(social.following.map(u => String(u._id)))

  const handleFollow = async (userId) => {
    await api.post(`/users/${userId}/follow`)
    const { data } = await api.get('/users/me/social')
    setSocial(data)
  }

  const handleUnfollow = async (userId) => {
    await api.post(`/users/${userId}/unfollow`)
    const { data } = await api.get('/users/me/social')
    setSocial(data)
  }

  if (!user) return null

  const initial    = user.name.charAt(0).toUpperCase()
  const roleLabel  = ROLE_LABELS[user.role] ?? user.role
  const isFighter  = user.role === 'fighter'
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const handleLogout = () => { logout(); navigate('/login') }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await api.delete('/users/me')
      logout()
      navigate('/login')
    } catch {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  const isCoach = user.role === 'coach'

  const startGymEdit = () => {
    setGymForm({
      name:        gym?.name        ?? '',
      city:        gym?.city        ?? '',
      address:     gym?.address     ?? '',
      phone:       gym?.phone       ?? '',
      website:     gym?.website     ?? '',
      description: gym?.description ?? '',
    })
    setGymError('')
    setGymSuccess(false)
    setGymEditing(true)
  }

  const cancelGymEdit = () => { setGymEditing(false); setGymError('') }
  const setG = (field) => (e) => setGymForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleGymSave = async (e) => {
    e.preventDefault()
    if (!gymForm.name.trim()) { setGymError('Gym name is required.'); return }
    setGymSaving(true)
    setGymError('')
    try {
      const { data } = await api.put(`/gyms/${user.gymId}`, gymForm)
      setGym(data)
      setGymSuccess(true)
      setGymEditing(false)
    } catch (err) {
      setGymError(err?.response?.data?.message ?? 'Could not save gym settings.')
    } finally {
      setGymSaving(false)
    }
  }

  const startEdit = () => {
    setForm({
      name:        user.name           ?? '',
      gender:      user.gender         ?? '',
      weightClass: user.weightClass    ?? '',
      stance:      user.stance         ?? '',
      wins:        user.record?.wins   ?? 0,
      losses:      user.record?.losses ?? 0,
      draws:       user.record?.draws  ?? 0,
      location:    user.location       ?? '',
      gym:         user.gym            ?? '',
      age:         user.age            ?? '',
    })
    setError('')
    setSuccess(false)
    setEditing(true)
  }

  const cancelEdit = () => { setEditing(false); setError('') }
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    try {
      await updateUser(form)
      setSuccess(true)
      setEditing(false)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-page">

      {/* Profile card */}
      <div className="account-profile-card">
        <div className="account-profile-identity">
          <div className="account-avatar">{initial}</div>
          <div className="account-profile-info">
            <span className={`badge ${isFighter ? 'badge-red' : 'badge-blue'}`}>{roleLabel}</span>
            <h1 className="account-name">{user.name}</h1>
            <div className="account-social-counts">
              <span className="account-social-stat">
                <strong>{social.followers.length}</strong> followers
              </span>
              <span className="account-social-dot">·</span>
              <span className="account-social-stat">
                <strong>{social.following.length}</strong> following
              </span>
            </div>
          </div>
        </div>
        {!editing && (
          <div className="account-profile-actions">
            <button className="btn btn-red btn-sm" onClick={() => setShowFind(true)}>
              Find People
            </button>
            <button className="btn btn-outline btn-sm account-edit-btn" onClick={startEdit}>
              <EditIcon /> Edit
            </button>
          </div>
        )}
      </div>

      {/* Fighter record */}
      {isFighter && user.record && !editing && (
        <div className="account-record">
          <div className="account-record-item">
            <span className="account-record-value">{user.record.wins ?? 0}</span>
            <span className="account-record-label">Wins</span>
          </div>
          <div className="account-record-divider" />
          <div className="account-record-item">
            <span className="account-record-value">{user.record.losses ?? 0}</span>
            <span className="account-record-label">Losses</span>
          </div>
          <div className="account-record-divider" />
          <div className="account-record-item">
            <span className="account-record-value">{user.record.draws ?? 0}</span>
            <span className="account-record-label">Draws</span>
          </div>
        </div>
      )}

      {success && <div className="account-success-banner">Profile updated successfully.</div>}

      {/* Edit form */}
      {editing ? (
        <form className="account-edit-form" onSubmit={handleSave}>

          <div className="account-section">
            <p className="account-section-label">Account Info</p>
            <div className="account-edit-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="input" value={form.name} onChange={set('name')} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
          </div>

          {isFighter && (
            <div className="account-section">
              <p className="account-section-label">Fighter Profile</p>
              <div className="account-edit-grid">
                <div className="form-group">
                  <label className="form-label">Division</label>
                  <select className="input" value={form.gender} onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value, weightClass: '' }))}>
                    <option value="">Select division</option>
                    <option value="male">Men&apos;s</option>
                    <option value="female">Women&apos;s</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Weight Class</label>
                  <select className="input" value={form.weightClass} onChange={set('weightClass')} disabled={!form.gender}>
                    <option value="">{form.gender ? 'Select weight class' : 'Select division first'}</option>
                    {(form.gender === 'male' ? MENS_WEIGHT_CLASSES : WOMENS_WEIGHT_CLASSES).map(w => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stance</label>
                  <select className="input" value={form.stance} onChange={set('stance')}>
                    <option value="">Select stance</option>
                    <option value="orthodox">Orthodox</option>
                    <option value="southpaw">Southpaw</option>
                    <option value="switch">Switch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="input" value={form.location} onChange={set('location')} placeholder="City, Country" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gym</label>
                  <input className="input" value={form.gym} onChange={set('gym')} placeholder="Your gym" />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="input" type="number" min="16" max="60" value={form.age} onChange={set('age')} placeholder="Age" />
                </div>
              </div>

              <div className="account-edit-record">
                <p className="account-section-label" style={{ padding: 0, border: 'none', letterSpacing: '1.5px' }}>Fight Record</p>
                <div className="account-edit-record-row">
                  <div className="form-group">
                    <label className="form-label">Wins</label>
                    <input className="input" type="number" min="0" value={form.wins} onChange={set('wins')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Losses</label>
                    <input className="input" type="number" min="0" value={form.losses} onChange={set('losses')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Draws</label>
                    <input className="input" type="number" min="0" value={form.draws} onChange={set('draws')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <p className="account-edit-error">{error}</p>}

          <div className="account-edit-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          </div>

        </form>
      ) : (
        <div className="account-sections">

          <div className="account-section">
            <p className="account-section-label">Account</p>
            <Field label="Full Name"    value={user.name} />
            <Field label="Email"        value={user.email} />
            <Field label="Role"         value={roleLabel} />
            <Field label="Member Since" value={joinedDate} />
          </div>

          {isFighter && (
            <div className="account-section">
              <p className="account-section-label">Fighter Profile</p>
              <Field label="Division"     value={user.gender === 'male' ? "Men's" : user.gender === 'female' ? "Women's" : null} />
              <Field label="Weight Class" value={user.weightClass} />
              <Field label="Stance"       value={user.stance
                ? user.stance.charAt(0).toUpperCase() + user.stance.slice(1)
                : null} />
              <Field label="Age"          value={user.age} />
              <Field label="Location"     value={user.location} />
              <Field label="Current Gym"  value={user.gym} />
            </div>
          )}

          {isCoach && gym && (
            <div className="account-section">
              <div className="account-section-header">
                <p className="account-section-label" style={{ margin: 0, border: 'none', padding: 0 }}>Gym Settings</p>
                {!gymEditing && (
                  <button className="btn btn-outline btn-sm account-edit-btn" onClick={startGymEdit}>
                    <EditIcon /> Edit
                  </button>
                )}
              </div>

              {gymSuccess && <div className="account-success-banner" style={{ marginTop: 12 }}>Gym updated.</div>}

              {gymEditing ? (
                <form onSubmit={handleGymSave} style={{ marginTop: 16 }}>
                  <div className="account-edit-grid">
                    <div className="form-group">
                      <label className="form-label">Gym Name</label>
                      <input className="input" value={gymForm.name} onChange={setG('name')} placeholder="Gym name" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City / Location</label>
                      <input className="input" value={gymForm.city} onChange={setG('city')} placeholder="e.g. London" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input className="input" value={gymForm.address} onChange={setG('address')} placeholder="Street address" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="input" type="tel" value={gymForm.phone} onChange={setG('phone')} placeholder="Phone number" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Website</label>
                      <input className="input" type="url" value={gymForm.website} onChange={setG('website')} placeholder="https://yourgym.com" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Description</label>
                      <textarea className="input textarea" rows={3} value={gymForm.description} onChange={setG('description')} placeholder="Tell fighters about your gym…" />
                    </div>
                  </div>
                  {gymError && <p className="account-edit-error">{gymError}</p>}
                  <div className="account-edit-actions">
                    <button type="submit" className="btn btn-primary" disabled={gymSaving}>
                      {gymSaving ? 'Saving…' : 'Save Gym'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={cancelGymEdit} disabled={gymSaving}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <Field label="Name"        value={gym.name} />
                  <Field label="City"        value={gym.city} />
                  <Field label="Address"     value={gym.address} />
                  <Field label="Phone"       value={gym.phone} />
                  <Field label="Website"     value={gym.website} />
                  <Field label="Description" value={gym.description} />
                </>
              )}
            </div>
          )}

          <div className="account-section">
            <button className="account-signout-btn" onClick={handleLogout}>Sign Out</button>
            <button className="account-delete-btn" onClick={() => setShowDelete(true)}>
              Delete Account
            </button>
          </div>

        </div>
      )}

      {showFind && (
        <FindPeopleModal
          onClose={() => setShowFind(false)}
          followingIds={followingIds}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      )}

      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteAccount}
          loading={deleting}
        />
      )}

    </div>
  )
}
