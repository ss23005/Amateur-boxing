import { useParams, Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'

export default function EventDetail() {
  const { id } = useParams()
  const { data: event, loading, error } = useFetch(`/events/${id}`)

  if (loading) return <div className="loading-state">Loading event...</div>
  if (error) return (
    <div className="page">
      <div className="error-banner">Error: {error}</div>
    </div>
  )
  if (!event) return null

  const date = new Date(event.date)

  return (
    <div className="page">
      <Link to="/events" className="back-link">← Back to Events</Link>

      <div className="detail-header">
        <p className="page-eyebrow">Event</p>
        <h1 className="detail-title">{event.title}</h1>
        <div className="detail-meta">
          <span className="badge badge-blue">
            {date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {event.venue?.name && (
            <span className="event-detail-date">
              {event.venue.name}{event.venue.city ? ` · ${event.venue.city}` : ''}
            </span>
          )}
        </div>
      </div>

      {event.description && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <h2 className="section-title">About This Event</h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.72, margin: 0 }}>{event.description}</p>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">
          Bouts
          {event.bouts?.length > 0 && (
            <span style={{ marginLeft: '8px', fontFamily: 'var(--sans)', fontSize: '12px', textTransform: 'none', letterSpacing: 0, color: 'var(--text-4)', fontWeight: 500 }}>
              {event.bouts.length} scheduled
            </span>
          )}
        </h2>
        {(!event.bouts || event.bouts.length === 0) ? (
          <p style={{ color: 'var(--text-4)', fontSize: '14px', margin: 0, fontWeight: 500 }}>
            No bouts announced yet.
          </p>
        ) : (
          <div className="bout-list">
            {event.bouts.map((bout, i) => (
              <div key={i} className="bout-item">
                {typeof bout === 'string' ? bout : JSON.stringify(bout)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
