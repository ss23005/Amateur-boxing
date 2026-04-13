import { useFetch } from '../../hooks/useFetch'
import { Link } from 'react-router-dom'

export default function EventList() {
  const { data: events, loading, error } = useFetch('/events')

  if (loading) return <div className="loading-state">Loading events...</div>
  if (error) return (
    <div className="page">
      <div className="error-banner">Error: {error}</div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header" data-tutorial="events-main">
        <div>
          <p className="page-eyebrow">Schedule</p>
          <h1 className="page-title">Events</h1>
        </div>
        {events?.length > 0 && (
          <span className="page-count">{events.length} events</span>
        )}
      </div>

      {events?.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No Events Scheduled</p>
          <p className="empty-state-desc">Check back soon for upcoming bouts and shows.</p>
        </div>
      )}

      <div className="event-list">
        {events?.map((e) => {
          const date = new Date(e.date)
          const month = date.toLocaleString('default', { month: 'short' }).toUpperCase()
          const day = date.getDate()
          return (
            <Link key={e._id} to={`/events/${e._id}`} className="event-card">
              <div className="event-card-date">
                <div className="event-card-date-month">{month}</div>
                <div className="event-card-date-day">{day}</div>
              </div>
              <div className="event-card-info">
                <p className="event-card-title">{e.title}</p>
                {e.venue?.name && (
                  <p className="event-card-venue">
                    {e.venue.name}{e.venue.city ? `, ${e.venue.city}` : ''}
                  </p>
                )}
              </div>
              <span className="event-card-arrow">›</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
