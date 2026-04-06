import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import routes from './routes'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Boxing Platform</Link>

      <div className="navbar-links">
        <NavLink to="/fighters" className="navbar-link">Fighters</NavLink>
        <NavLink to="/events" className="navbar-link">Events</NavLink>
        <NavLink to="/feed" className="navbar-link">Feed</NavLink>
        {user && <NavLink to="/messages" className="navbar-link">Messages</NavLink>}
      </div>

      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-username">{user.name}</span>
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar-link">Login</NavLink>
            <NavLink to="/register" className="btn btn-ghost">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

function AppRoutes() {
  return (
    <main style={{ flex: 1 }}>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
