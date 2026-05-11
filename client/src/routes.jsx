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

const routes = [
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/account',  element: <ProtectedRoute><Account /></ProtectedRoute> },
  { path: '/feed',     element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/admin',    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },

  { path: '/fighters',     element: <FighterList /> },
  { path: '/fighters/:id', element: <FighterProfile /> },
  { path: '/events',       element: <ComingSoon /> },
  { path: '/events/:id',   element: <ComingSoon /> },
  { path: '/messages',     element: <ProtectedRoute><Inbox /></ProtectedRoute> },
  { path: '/messages/:id', element: <ProtectedRoute><Conversation /></ProtectedRoute> },
  { path: '/gyms',         element: <ComingSoon /> },
]

export default routes
