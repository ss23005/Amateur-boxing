import PreSignup from './pages/Auth/PreSignup'
import PreLogin from './pages/Auth/PreLogin'
import CheckEmail from './pages/Auth/CheckEmail'
import { Navigate } from 'react-router-dom'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Account from './pages/Account/Account'
import Feed from './pages/Feed/Feed'
import Discover from './pages/Discover/Discover'
import FighterDirectory from './pages/Fighters/FighterDirectory'
import GymDirectory from './pages/Gyms/GymDirectory'
import UserPublicProfile from './pages/Users/UserPublicProfile'
import GymPublicProfile from './pages/Gyms/GymPublicProfile'
import Inbox from './pages/Messages/Inbox'
import Conversation from './pages/Messages/Conversation'
import EventList from './pages/Events/EventList'
import EventDetail from './pages/Events/EventDetail'

const routes = [
  // ── Auth (no nav) ──
  { path: '/welcome',               element: <PreSignup />,                                                    noNav: true },
  { path: '/register',              element: <Navigate to="/welcome"  replace />,                              noNav: true },
  { path: '/sign-in',               element: <PreLogin />,                                                     noNav: true },
  { path: '/login',                 element: <Navigate to="/sign-in"  replace />,                              noNav: true },
  { path: '/check-email',           element: <CheckEmail />,                                                   noNav: true },
  { path: '/forgot-password',       element: <ForgotPassword />,                                               noNav: true },
  { path: '/reset-password/:token', element: <ResetPassword />,                                                noNav: true },

  // ── App (with nav) ──
  { path: '/feed',                  element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/account',               element: <ProtectedRoute><Account /></ProtectedRoute>,                                noNav: true },
  { path: '/discover',              element: <ProtectedRoute><Discover /></ProtectedRoute>,                    noNav: true },
  { path: '/fighters',              element: <ProtectedRoute><FighterDirectory /></ProtectedRoute>,            noNav: true },
  { path: '/gyms',                  element: <ProtectedRoute><GymDirectory /></ProtectedRoute> },
  { path: '/gyms/:slug',            element: <GymPublicProfile />,                                            noNav: true },
  { path: '/users/:username',       element: <UserPublicProfile />,                                           noNav: true },
  { path: '/messages',              element: <ProtectedRoute><Inbox /></ProtectedRoute> },
  { path: '/messages/:id',          element: <ProtectedRoute><Conversation /></ProtectedRoute> },
  { path: '/events',                element: <ProtectedRoute><EventList /></ProtectedRoute> },
  { path: '/events/:id',            element: <ProtectedRoute><EventDetail /></ProtectedRoute> },

  // ── Admin ──
  { path: '/admin',                 element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
]

export default routes
