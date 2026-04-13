import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Account from './pages/Account/Account'
import FighterList from './pages/Fighters/FighterList'
import FighterProfile from './pages/Fighters/FighterProfile'
import EventList from './pages/Events/EventList'
import EventDetail from './pages/Events/EventDetail'
import Feed from './pages/Feed/Feed'
import Inbox from './pages/Messages/Inbox'
import Conversation from './pages/Messages/Conversation'
import GymDirectory from './pages/Gyms/GymDirectory'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ComingSoon from './pages/ComingSoon'

// ─── temporarily hidden from client demo ─────────────────────────────────────
const COMING_SOON = true

const routes = [
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/account',  element: <ProtectedRoute><Account /></ProtectedRoute> },
  { path: '/feed',     element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/admin',    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },

  // Pages shown as "Coming Soon" during client demo
  { path: '/fighters',     element: COMING_SOON ? <ComingSoon /> : <FighterList /> },
  { path: '/fighters/:id', element: COMING_SOON ? <ComingSoon /> : <FighterProfile /> },
  { path: '/events',       element: COMING_SOON ? <ComingSoon /> : <EventList /> },
  { path: '/events/:id',   element: COMING_SOON ? <ComingSoon /> : <EventDetail /> },
  { path: '/messages',     element: COMING_SOON ? <ComingSoon /> : <ProtectedRoute><Inbox /></ProtectedRoute> },
  { path: '/messages/:id', element: COMING_SOON ? <ComingSoon /> : <ProtectedRoute><Conversation /></ProtectedRoute> },
  { path: '/gyms',         element: COMING_SOON ? <ComingSoon /> : <GymDirectory /> },
]

export default routes
