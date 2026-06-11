import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import PreSignup from './pages/Auth/PreSignup'
import PreLogin from './pages/Auth/PreLogin'
import Account from './pages/Account/Account'
import FighterList from './pages/Fighters/FighterList'
import FighterProfile from './pages/Fighters/FighterProfile'
import Feed from './pages/Feed/Feed'
import Inbox from './pages/Messages/Inbox'
import Conversation from './pages/Messages/Conversation'
import GymDirectory from './pages/Gyms/GymDirectory'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Discover from './pages/Discover/Discover'
import UserPublicProfile from './pages/Users/UserPublicProfile'

const routes = [
  { path: '/welcome',  element: <PreSignup />, noNav: true },
  { path: '/sign-in',  element: <PreLogin />,  noNav: true },
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/account',  element: <ProtectedRoute><Account /></ProtectedRoute> },
  { path: '/feed',     element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/admin',    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },

  { path: '/fighters',     element: <FighterList /> },
  { path: '/fighters/:id', element: <FighterProfile /> },
  { path: '/messages',     element: <ProtectedRoute><Inbox /></ProtectedRoute> },
  { path: '/messages/:id', element: <ProtectedRoute><Conversation /></ProtectedRoute> },
  { path: '/gyms',         element: <GymDirectory /> },

  { path: '/discover',   element: <Discover />,           noNav: true },
  { path: '/users/:id',  element: <UserPublicProfile />,  noNav: true },
]

export default routes
