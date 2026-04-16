import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TutorialProvider } from './context/TutorialContext'
import { useAuth } from './hooks/useAuth'
import Tutorial from './components/Tutorial/Tutorial'
import routes from './routes'
import api from './services/api'
import logo from './assets/logo.svg'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role === 'superadmin') return <Navigate to="/admin" replace />
  return <Navigate to={user ? '/feed' : '/register'} replace />
}

function timeAgoShort(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function notifText(n) {
  const name = n.sender?.name ?? 'Someone'
  if (n.type === 'follow')  return `${name} started following you`
  if (n.type === 'like')    return `${name} liked your post`
  if (n.type === 'comment') return `${name} commented on your post`
  return ''
}

function NotificationBell() {
  const [open, setOpen]           = useState(false)
  const [notifs, setNotifs]       = useState([])
  const [loading, setLoading]     = useState(false)
  const panelRef = useRef(null)

  const unread = notifs.filter(n => !n.read).length

  const fetchNotifs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setNotifs(data)
    } catch {}
    finally { setLoading(false) }
  }

  const handleOpen = async () => {
    if (!open) await fetchNotifs()
    setOpen(o => !o)
  }

  // Mark all read when panel opens
  useEffect(() => {
    if (!open || unread === 0) return
    api.put('/notifications/read-all').then(() => {
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    }).catch(() => {})
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!panelRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Poll for new notifications every 30s
  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="notif-wrap" ref={panelRef}>
      <button className="notif-bell" onClick={handleOpen} aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
          </div>
          {loading && <p className="notif-empty">Loading…</p>}
          {!loading && notifs.length === 0 && (
            <p className="notif-empty">No notifications yet</p>
          )}
          <div className="notif-list">
            {notifs.map(n => (
              <div key={n._id} className={`notif-item${n.read ? '' : ' notif-item--unread'}`}>
                <div className="notif-avatar">
                  {(n.sender?.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="notif-item-info">
                  <p className="notif-item-text">{notifText(n)}</p>
                  <span className="notif-item-time">{timeAgoShort(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Navbar() {
  const { user } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/feed" className="navbar-brand">
        <img src={logo} alt="Amateur Boxing World" className="navbar-logo" />
      </Link>

      <div className="navbar-links">
        <NavLink to="/fighters" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Fighters</NavLink>
        <NavLink to="/events"   className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Events</NavLink>
        <NavLink to="/gyms"     className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Gyms</NavLink>
        <NavLink to="/feed"     className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Feed</NavLink>
        {user && <NavLink to="/messages" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Messages</NavLink>}
      </div>

      <div className="navbar-auth">
        {user ? (
          <>
            <NotificationBell />
            <NavLink to="/account" className="navbar-account-btn">
              <span className="navbar-account-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="navbar-username">{user.name}</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login"    className="navbar-link">Login</NavLink>
            <NavLink to="/register" className="btn btn-ghost">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

function MobileNav() {
  const { user } = useAuth()
  const cls = ({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`

  return (
    <nav className="mobile-nav">

      <NavLink to="/feed" className={cls}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 11h16M4 16h10"/>
        </svg>
        <span>Feed</span>
      </NavLink>

      <NavLink to="/fighters" className={cls}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-3.8 3.6-7 8-7s8 3.2 8 7"/>
        </svg>
        <span>Fighters</span>
      </NavLink>

      <NavLink to="/events" className={cls}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="17" rx="2"/>
          <path d="M8 2v4M16 2v4M3 10h18"/>
        </svg>
        <span>Events</span>
      </NavLink>

      <NavLink to="/gyms" className={cls}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>Gyms</span>
      </NavLink>

      {user && (
        <NavLink to="/messages" className={cls}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>Messages</span>
        </NavLink>
      )}

      {user ? (
        <NavLink to="/account" className={cls}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M6.5 20.5c.8-3 2.9-5 5.5-5s4.7 2 5.5 5"/>
          </svg>
          <span>Account</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={cls}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
          <span>Login</span>
        </NavLink>
      )}

    </nav>
  )
}

function AppShell() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'superadmin'

  if (isSuperAdmin) {
    return (
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </main>
      <MobileNav />
      <Tutorial />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TutorialProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </TutorialProvider>
    </AuthProvider>
  )
}
