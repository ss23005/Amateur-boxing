import PreSignup from './pages/Auth/PreSignup'
import PreLogin from './pages/Auth/PreLogin'
import CheckEmail from './pages/Auth/CheckEmail'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Discover from './pages/Discover/Discover'
import UserPublicProfile from './pages/Users/UserPublicProfile'

const routes = [
  { path: '/welcome',          element: <PreSignup />,                                  noNav: true },
  { path: '/sign-in',          element: <PreLogin />,                                   noNav: true },
  { path: '/check-email',      element: <CheckEmail />,                                 noNav: true },
  { path: '/discover',         element: <Discover />,                                   noNav: true },
  { path: '/users/:username',  element: <UserPublicProfile />,                          noNav: true },
  { path: '/admin',            element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
]

export default routes
