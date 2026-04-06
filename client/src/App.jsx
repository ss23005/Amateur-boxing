import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import routes from './routes'

function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem' }}>
      <Link to="/">Home</Link>
      <Link to="/fighters">Fighters</Link>
      <Link to="/events">Events</Link>
      <Link to="/feed">Feed</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/login">Login</Link>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ padding: '1rem' }}>
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}
