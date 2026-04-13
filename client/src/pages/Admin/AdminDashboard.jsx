import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}

function IconRequests() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────

function BarChart({ data }) {
  if (!data?.length) return <p className="adm-empty">No signup data yet.</p>
  const max = Math.max(...data.map(d => d.count), 1)
  const last14 = data.slice(-14)
  return (
    <div className="adm-barchart">
      {last14.map(d => (
        <div key={d._id} className="adm-barchart-col" title={`${d._id}: ${d.count} sign-up${d.count !== 1 ? 's' : ''}`}>
          <div className="adm-barchart-bar" style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }} />
          <span className="adm-barchart-label">{d._id.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  return (
    <div className={`adm-stat-card${accent ? ' adm-stat-card--accent' : ''}`}>
      <div className="adm-stat-value">{value ?? '—'}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="adm-loading">Loading analytics…</div>
  if (error)   return <div className="adm-error">{error}</div>

  const { totals, recentUsers, recentPosts, signupsByDay, roleBreakdown } = data

  return (
    <div className="adm-overview">

      <h2 className="adm-section-title">Platform Overview</h2>

      <div className="adm-stat-grid">
        <StatCard label="Total Users"    value={totals.users}    accent />
        <StatCard label="Total Posts"    value={totals.posts} />
        <StatCard label="Total Likes"    value={totals.likes} />
        <StatCard label="Total Comments" value={totals.comments} />
        <StatCard label="Fighters"       value={totals.fighters} />
        <StatCard label="Events"         value={totals.events} />
      </div>

      <div className="adm-row">
        <div className="adm-card adm-card--grow">
          <h3 className="adm-card-title">Sign-ups (last 14 days)</h3>
          <BarChart data={signupsByDay} />
        </div>

        <div className="adm-card">
          <h3 className="adm-card-title">Role Breakdown</h3>
          <div className="adm-role-list">
            {roleBreakdown.map(r => (
              <div key={r._id} className="adm-role-row">
                <span className="adm-role-name">{r._id}</span>
                <span className="adm-role-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="adm-row">
        <div className="adm-card adm-card--grow">
          <h3 className="adm-card-title">Recent Sign-ups</h3>
          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td><span className={`adm-badge adm-badge--${u.role}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-card adm-card--grow">
          <h3 className="adm-card-title">Recent Posts</h3>
          <table className="adm-table">
            <thead>
              <tr><th>Author</th><th>Content</th><th>Likes</th><th>Comments</th></tr>
            </thead>
            <tbody>
              {recentPosts.map(p => (
                <tr key={p._id}>
                  <td>{p.author?.name ?? 'Unknown'}</td>
                  <td className="adm-cell-truncate">{p.content?.slice(0, 50)}{p.content?.length > 50 ? '…' : ''}</td>
                  <td>{p.likes?.length ?? 0}</td>
                  <td>{p.comments?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// ── Upload Tab ────────────────────────────────────────────────────────────────

const EMPTY_EVENT = {
  title: '', date: '', venue: '', location: '', description: '',
  ticketUrl: '', promoter: '',
}
const EMPTY_NEWS = {
  title: '', body: '', image: '', published: false,
}
const EMPTY_POST = { content: '', media: '' }

function UploadTab() {
  const [type, setType]       = useState('event')
  const [eventForm, setEF]    = useState(EMPTY_EVENT)
  const [newsForm, setNF]     = useState(EMPTY_NEWS)
  const [postForm, setPF]     = useState(EMPTY_POST)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const setE = f => e => setEF(p => ({ ...p, [f]: e.target.value }))
  const setN = f => e => setNF(p => ({ ...p, [f]: f === 'published' ? e.target.checked : e.target.value }))
  const setP = f => e => setPF(p => ({ ...p, [f]: e.target.value }))

  const reset = () => {
    setEF(EMPTY_EVENT); setNF(EMPTY_NEWS); setPF(EMPTY_POST)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      if (type === 'event') {
        await api.post('/admin/events', eventForm)
        setSuccess('Event created successfully.')
        setEF(EMPTY_EVENT)
      } else if (type === 'news' || type === 'interview') {
        await api.post('/admin/news', newsForm)
        setSuccess(`${type === 'interview' ? 'Interview' : 'Article'} published.`)
        setNF(EMPTY_NEWS)
      } else if (type === 'post') {
        await api.post('/feed', postForm)
        setSuccess('Post published to feed.')
        setPF(EMPTY_POST)
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="adm-upload">
      <h2 className="adm-section-title">Upload Content</h2>

      <div className="adm-type-tabs">
        {[
          { key: 'event',     label: 'Event' },
          { key: 'news',      label: 'News / Article' },
          { key: 'interview', label: 'Interview' },
          { key: 'post',      label: 'Feed Post' },
        ].map(t => (
          <button
            key={t.key}
            className={`adm-type-tab${type === t.key ? ' active' : ''}`}
            onClick={() => { setType(t.key); reset() }}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {success && <div className="adm-success">{success}</div>}
      {error   && <div className="adm-error-inline">{error}</div>}

      <form className="adm-form" onSubmit={handleSubmit}>

        {/* ── Event Form ── */}
        {type === 'event' && (
          <>
            <div className="adm-form-row">
              <div className="adm-form-group adm-form-group--full">
                <label>Event Title *</label>
                <input className="input" value={eventForm.title} onChange={setE('title')} required placeholder="e.g. ABW Championship Night" />
              </div>
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Date *</label>
                <input className="input" type="date" value={eventForm.date} onChange={setE('date')} required />
              </div>
              <div className="adm-form-group">
                <label>Venue</label>
                <input className="input" value={eventForm.venue} onChange={setE('venue')} placeholder="Venue name" />
              </div>
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Location</label>
                <input className="input" value={eventForm.location} onChange={setE('location')} placeholder="City, Country" />
              </div>
              <div className="adm-form-group">
                <label>Ticket URL</label>
                <input className="input" value={eventForm.ticketUrl} onChange={setE('ticketUrl')} placeholder="https://…" />
              </div>
            </div>
            <div className="adm-form-group adm-form-group--full">
              <label>Description</label>
              <textarea className="input adm-textarea" value={eventForm.description} onChange={setE('description')} placeholder="Describe the event…" rows={4} />
            </div>
          </>
        )}

        {/* ── News / Interview Form ── */}
        {(type === 'news' || type === 'interview') && (
          <>
            <div className="adm-form-group adm-form-group--full">
              <label>{type === 'interview' ? 'Interview' : 'Article'} Title *</label>
              <input className="input" value={newsForm.title} onChange={setN('title')} required placeholder="Title" />
            </div>
            <div className="adm-form-group adm-form-group--full">
              <label>Cover Image URL</label>
              <input className="input" value={newsForm.image} onChange={setN('image')} placeholder="https://…" />
            </div>
            <div className="adm-form-group adm-form-group--full">
              <label>Body *</label>
              <textarea className="input adm-textarea adm-textarea--tall" value={newsForm.body} onChange={setN('body')} required
                placeholder={type === 'interview' ? 'Paste interview transcript or write article…' : 'Write your article…'}
                rows={10} />
            </div>
            <div className="adm-form-group">
              <label className="adm-checkbox-label">
                <input type="checkbox" checked={newsForm.published} onChange={setN('published')} />
                Publish immediately
              </label>
            </div>
          </>
        )}

        {/* ── Feed Post Form ── */}
        {type === 'post' && (
          <>
            <div className="adm-form-group adm-form-group--full">
              <label>Post Content *</label>
              <textarea className="input adm-textarea" value={postForm.content} onChange={setP('content')} required
                placeholder="Write a post for the feed…" rows={5} />
            </div>
            <div className="adm-form-group adm-form-group--full">
              <label>Media URL (optional)</label>
              <input className="input" value={postForm.media} onChange={setP('media')} placeholder="https://…" />
            </div>
          </>
        )}

        <div className="adm-form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Publishing…' : `Publish ${type === 'event' ? 'Event' : type === 'interview' ? 'Interview' : type === 'news' ? 'Article' : 'Post'}`}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

const ROLES = ['fan', 'fighter', 'coach', 'admin', 'superadmin']

function UsersTab() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [updating, setUpdating] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const changeRole = async (userId, role) => {
    setUpdating(userId)
    try {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: data.role } : u))
    } catch {
      // silent
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="adm-loading">Loading users…</div>
  if (error)   return <div className="adm-error">{error}</div>

  return (
    <div className="adm-users">
      <h2 className="adm-section-title">All Users <span className="adm-count">({users.length})</span></h2>
      <div className="adm-table-wrap">
        <table className="adm-table adm-table--full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td className="adm-cell-muted">{u.email}</td>
                <td><span className={`adm-badge adm-badge--${u.role}`}>{u.role}</span></td>
                <td className="adm-cell-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    className="adm-role-select"
                    value={u.role}
                    disabled={updating === u._id}
                    onChange={e => changeRole(u._id, e.target.value)}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Change Requests Tab ───────────────────────────────────────────────────────

function RequestsTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [reviewing, setReviewing] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/change-requests')
      .then(r => setRequests(r.data))
      .catch(() => setError('Failed to load requests.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const review = async (id, status) => {
    setReviewing(id)
    try {
      const { data } = await api.put(`/admin/change-requests/${id}/review`, { status })
      setRequests(prev => prev.map(r => r._id === id ? data : r))
    } catch {
      // silent
    } finally {
      setReviewing(null)
    }
  }

  if (loading) return <div className="adm-loading">Loading requests…</div>
  if (error)   return <div className="adm-error">{error}</div>

  const pending = requests.filter(r => r.status === 'pending')
  const reviewed = requests.filter(r => r.status !== 'pending')

  return (
    <div className="adm-requests">
      <h2 className="adm-section-title">Fighter Change Requests</h2>

      {pending.length === 0 && (
        <div className="adm-empty-state">No pending requests.</div>
      )}

      {pending.map(req => (
        <div key={req._id} className="adm-req-card">
          <div className="adm-req-header">
            <div>
              <span className="adm-req-fighter">{req.fighter?.name ?? 'Unknown Fighter'}</span>
              <span className="adm-req-by"> — requested by {req.user?.name} ({req.user?.email})</span>
            </div>
            <span className="adm-badge adm-badge--pending">Pending</span>
          </div>
          <div className="adm-req-changes">
            {Object.entries(req.changes ?? {}).map(([field, { from, to }]) => (
              <div key={field} className="adm-req-change">
                <span className="adm-req-field">{field}</span>
                <span className="adm-req-from">{String(from)}</span>
                <span className="adm-req-arrow">→</span>
                <span className="adm-req-to">{String(to)}</span>
              </div>
            ))}
          </div>
          <div className="adm-req-actions">
            <button className="btn btn-primary adm-btn-sm" disabled={reviewing === req._id}
              onClick={() => review(req._id, 'approved')}>Approve</button>
            <button className="btn btn-outline adm-btn-sm" disabled={reviewing === req._id}
              onClick={() => review(req._id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}

      {reviewed.length > 0 && (
        <>
          <h3 className="adm-section-subtitle">Previously Reviewed</h3>
          {reviewed.map(req => (
            <div key={req._id} className={`adm-req-card adm-req-card--${req.status}`}>
              <div className="adm-req-header">
                <span className="adm-req-fighter">{req.fighter?.name ?? 'Unknown'}</span>
                <span className={`adm-badge adm-badge--${req.status}`}>{req.status}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Gyms Tab ──────────────────────────────────────────────────────────────────

function IconGym() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

const EMPTY_GYM = { name: '', city: '', country: '', address: '', phone: '', website: '', email: '', description: '' }

function GymEditForm({ gym, onSave, onCancel }) {
  const [form, setForm]     = useState({
    name:        gym.name        ?? '',
    city:        gym.city        ?? '',
    country:     gym.country     ?? '',
    address:     gym.address     ?? '',
    phone:       gym.phone       ?? '',
    website:     gym.website     ?? '',
    email:       gym.email       ?? '',
    description: gym.description ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const { data } = await api.put(`/admin/gyms/${gym._id}`, form)
      onSave(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <form className="adm-gym-edit-form adm-form" onSubmit={handleSubmit}>
      <div className="adm-form-row">
        <div className="adm-form-group adm-form-group--full">
          <label>Gym Name *</label>
          <input className="input" value={form.name} onChange={set('name')} required />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label>City</label>
          <input className="input" value={form.city} onChange={set('city')} placeholder="e.g. London" />
        </div>
        <div className="adm-form-group">
          <label>Country</label>
          <input className="input" value={form.country} onChange={set('country')} placeholder="e.g. United Kingdom" />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group adm-form-group--full">
          <label>Address</label>
          <input className="input" value={form.address} onChange={set('address')} placeholder="Street address" />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-form-group">
          <label>Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="adm-form-group">
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="adm-form-group">
          <label>Website</label>
          <input className="input" value={form.website} onChange={set('website')} placeholder="https://…" />
        </div>
      </div>
      <div className="adm-form-group adm-form-group--full">
        <label>Description</label>
        <textarea className="input adm-textarea" rows={3} value={form.description} onChange={set('description')} />
      </div>
      {error && <div className="adm-error-inline" style={{ marginBottom: 8 }}>{error}</div>}
      <div className="adm-form-actions">
        <button className="btn btn-primary adm-btn-sm" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button className="btn btn-outline adm-btn-sm" type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function GymsTab() {
  const [gyms, setGyms]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState(EMPTY_GYM)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [deleting, setDeleting] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/gyms')
      .then(r => setGyms(r.data))
      .catch(() => setError('Failed to load gyms.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await api.post('/admin/gyms', form)
      setGyms(prev => [...prev, data].sort((a, b) => a.city.localeCompare(b.city)))
      setForm(EMPTY_GYM)
      setSuccess('Gym added successfully.')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to add gym.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/admin/gyms/${id}`)
      setGyms(prev => prev.filter(g => g._id !== id))
      if (editingId === id) setEditingId(null)
    } catch {
      // silent
    } finally {
      setDeleting(null)
    }
  }

  const handleSaved = (updated) => {
    setGyms(prev => prev.map(g => g._id === updated._id ? updated : g))
    setEditingId(null)
    setSuccess(`"${updated.name}" updated.`)
  }

  if (loading) return <div className="adm-loading">Loading gyms…</div>

  return (
    <div className="adm-gyms">
      <h2 className="adm-section-title">Gym Directory</h2>

      {success && <div className="adm-success">{success}</div>}
      {error   && <div className="adm-error-inline">{error}</div>}

      {/* Add form */}
      <div className="adm-card" style={{ marginBottom: 28 }}>
        <h3 className="adm-card-title">Add New Gym</h3>
        <form className="adm-form" onSubmit={handleAdd}>
          <div className="adm-form-row">
            <div className="adm-form-group adm-form-group--full">
              <label>Gym Name *</label>
              <input className="input" value={form.name} onChange={set('name')} required placeholder="e.g. City Boxing Club" />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>City *</label>
              <input className="input" value={form.city} onChange={set('city')} required placeholder="e.g. Manchester" />
            </div>
            <div className="adm-form-group">
              <label>Country</label>
              <input className="input" value={form.country} onChange={set('country')} placeholder="e.g. United Kingdom" />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group adm-form-group--full">
              <label>Address</label>
              <input className="input" value={form.address} onChange={set('address')} placeholder="Street address" />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+44 161 000 0000" />
            </div>
            <div className="adm-form-group">
              <label>Website</label>
              <input className="input" value={form.website} onChange={set('website')} placeholder="https://…" />
            </div>
            <div className="adm-form-group">
              <label>Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="info@gym.com" />
            </div>
          </div>
          <div className="adm-form-group adm-form-group--full">
            <label>Description</label>
            <textarea className="input adm-textarea" value={form.description} onChange={set('description')}
              placeholder="Brief description of the gym…" rows={3} />
          </div>
          <div className="adm-form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Adding…' : 'Add Gym'}
            </button>
          </div>
        </form>
      </div>

      {/* Gym listing */}
      <h3 className="adm-card-title" style={{ marginBottom: 14 }}>
        All Gyms <span className="adm-count">({gyms.length})</span>
      </h3>

      {gyms.length === 0 ? (
        <div className="adm-empty-state">No gyms added yet.</div>
      ) : (
        <div className="adm-gym-list">
          {gyms.map(gym => (
            <div key={gym._id} className={`adm-gym-row${editingId === gym._id ? ' adm-gym-row--editing' : ''}`}>
              {editingId === gym._id ? (
                <GymEditForm
                  gym={gym}
                  onSave={handleSaved}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="adm-gym-info">
                    <span className="adm-gym-name">{gym.name}</span>
                    <span className="adm-gym-location">{gym.city}{gym.country ? `, ${gym.country}` : ''}</span>
                    {gym.address && <span className="adm-gym-address">{gym.address}</span>}
                  </div>
                  <div className="adm-gym-meta">
                    {gym.phone && <span className="adm-gym-detail">{gym.phone}</span>}
                    {gym.website && <a href={gym.website} target="_blank" rel="noopener noreferrer" className="adm-gym-detail adm-gym-link">Website ↗</a>}
                  </div>
                  <div className="adm-gym-actions">
                    <button
                      className="adm-gym-edit"
                      onClick={() => { setEditingId(gym._id); setSuccess('') }}
                    >
                      Edit
                    </button>
                    <button
                      className="adm-gym-delete"
                      onClick={() => handleDelete(gym._id)}
                      disabled={deleting === gym._id}
                    >
                      {deleting === gym._id ? '…' : '✕'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',  label: 'Overview',       Icon: IconChart },
  { key: 'upload',    label: 'Upload Content',  Icon: IconUpload },
  { key: 'users',     label: 'Users',           Icon: IconUsers },
  { key: 'requests',  label: 'Requests',        Icon: IconRequests },
  { key: 'gyms',      label: 'Gyms',            Icon: IconGym },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="adm-shell">

      {/* ── Header ── */}
      <header className="adm-header">
        <div className="adm-header-brand">
          <span className="adm-brand-abbr">ABW</span>
          <span className="adm-brand-divider" />
          <span className="adm-brand-label">Admin</span>
        </div>
        <div className="adm-header-right">
          <span className="adm-header-name">{user?.name}</span>
          <span className="adm-header-badge">Superadmin</span>
          <button className="adm-logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="adm-body">

        {/* ── Sidebar ── */}
        <aside className="adm-sidebar">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`adm-nav-item${tab === key ? ' active' : ''}`}
              onClick={() => setTab(key)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        {/* ── Content ── */}
        <main className="adm-content">
          {tab === 'overview'  && <OverviewTab />}
          {tab === 'upload'    && <UploadTab />}
          {tab === 'users'     && <UsersTab />}
          {tab === 'requests'  && <RequestsTab />}
          {tab === 'gyms'      && <GymsTab />}
        </main>

      </div>
    </div>
  )
}
