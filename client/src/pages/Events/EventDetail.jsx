import { useParams } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'

export default function EventDetail() {
  const { id } = useParams()
  const { data: event, loading, error } = useFetch(`/events/${id}`)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!event) return null

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{new Date(event.date).toLocaleDateString()}</p>
      <p>{event.venue?.name}, {event.venue?.city}</p>
      <p>{event.description}</p>
      <h3>Bouts ({event.bouts?.length ?? 0})</h3>
    </div>
  )
}
