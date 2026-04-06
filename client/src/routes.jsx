import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import FighterList from './pages/Fighters/FighterList'
import FighterProfile from './pages/Fighters/FighterProfile'
import EventList from './pages/Events/EventList'
import EventDetail from './pages/Events/EventDetail'
import Feed from './pages/Feed/Feed'
import Inbox from './pages/Messages/Inbox'
import Conversation from './pages/Messages/Conversation'
import ProtectedRoute from './components/common/ProtectedRoute'

const routes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/fighters', element: <FighterList /> },
  { path: '/fighters/:id', element: <FighterProfile /> },
  { path: '/events', element: <EventList /> },
  { path: '/events/:id', element: <EventDetail /> },
  { path: '/feed', element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/messages', element: <ProtectedRoute><Inbox /></ProtectedRoute> },
  { path: '/messages/:id', element: <ProtectedRoute><Conversation /></ProtectedRoute> },
]

export default routes
