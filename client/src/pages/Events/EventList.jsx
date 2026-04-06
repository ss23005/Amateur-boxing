import { useFetch } from '../../hooks/useFetch'
import { Link } from 'react-router-dom'

export default function EventList() {
  const { data: events, loading, error } = useFetch('/events')

  if (loading) return <p>Loading events...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Events</h2>
      {events?.length === 0 && <p>No events scheduled.</p>}
      <ul>
        {events?.map((e) => (
          <li key={e._id}>
            <Link to={`/events/${e._id}`}>{e.title}</Link> — {new Date(e.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
