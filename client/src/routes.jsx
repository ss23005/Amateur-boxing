import PreSignup from './pages/Auth/PreSignup'
import PreLogin from './pages/Auth/PreLogin'
import CheckEmail from './pages/Auth/CheckEmail'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Discover from './pages/Discover/Discover'
import FighterDirectory from './pages/Fighters/FighterDirectory'
import UserPublicProfile from './pages/Users/UserPublicProfile'
import GymPublicProfile from './pages/Gyms/GymPublicProfile'

const routes = [
  { path: '/welcome',          element: <PreSignup />,                                           noNav: true },
  { path: '/sign-in',          element: <PreLogin />,                                            noNav: true },
  { path: '/check-email',      element: <CheckEmail />,                                          noNav: true },
  { path: '/discover',         element: <ProtectedRoute><Discover /></ProtectedRoute>,            noNav: true },
  { path: '/fighters',         element: <ProtectedRoute><FighterDirectory /></ProtectedRoute>,    noNav: true },
  { path: '/users/:username',  element: <UserPublicProfile />,                                   noNav: true },
  { path: '/gyms/:slug',       element: <GymPublicProfile />,                                    noNav: true },
  { path: '/admin',            element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
]

export default routes
