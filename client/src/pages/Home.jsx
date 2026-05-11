import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">The Global Amateur Boxing Community</p>
          <h1 className="hero-title hero-title-split">
            <span>Amateur Boxing</span>
            <span className="hero-title-world">World</span>
          </h1>
          <p className="hero-sub">
            Build your fighter profile, find upcoming bouts, connect with gyms,
            and follow the amateur boxing scene — all in one place.
          </p>
          <div className="hero-ctas">
            <Link to="/fighters" className="btn btn-red">Browse Fighters</Link>
            <Link to="/events" className="btn btn-ghost">View Events</Link>
          </div>
        </div>
      </div>

      <div className="home-section">
        <p className="home-section-label">Explore the Platform</p>
        <h2 className="home-section-title">Everything Amateur Boxing,<br />In One Place</h2>
        <div className="home-grid">
          <Link to="/fighters" className="home-card">
            <div className="home-card-label">Fighters</div>
            <h3 className="home-card-title">Amateur Fighters</h3>
            <p className="home-card-desc">
              Browse profiles, records, and stats for fighters in your region.
            </p>
          </Link>

          <Link to="/events" className="home-card">
            <div className="home-card-label">Events</div>
            <h3 className="home-card-title">Upcoming Bouts</h3>
            <p className="home-card-desc">
              Find upcoming boxing events, venues, and scheduled matchups.
            </p>
          </Link>

          <Link to="/feed" className="home-card">
            <div className="home-card-label">Community</div>
            <h3 className="home-card-title">Community Feed</h3>
            <p className="home-card-desc">
              Stay connected with the boxing community through posts and updates.
            </p>
          </Link>
        </div>
      </div>
    </>
  )
}
