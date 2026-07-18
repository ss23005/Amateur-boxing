import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Suppress Leaflet's default icon URL resolution (not needed with divIcons)
delete L.Icon.Default.prototype._getIconUrl

const makePin = (active, brandColor) => {
  const fill = active ? '#f97316' : (brandColor || '#e11d48')
  const scale = active ? 1.25 : 1
  const w = Math.round(28 * scale)
  const h = Math.round(40 * scale)
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="${w}" height="${h}" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35))">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${fill}"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.92"/>
    </svg>`,
    iconSize:    [w, h],
    iconAnchor:  [w / 2, h],
    popupAnchor: [0, -(h + 4)],
  })
}

function FitBounds({ points }) {
  const map    = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (!points.length || fitted.current) return
    fitted.current = true
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13)
    } else {
      map.fitBounds(points.map(p => [p.lat, p.lng]), { padding: [50, 50] })
    }
  }, [map, points])

  return null
}

export default function GymMap({ gyms, selectedId, onSelect }) {
  const navigate = useNavigate()
  const mapped   = (gyms ?? []).filter(g => g.coordinates?.lat && g.coordinates?.lng)
  const points   = mapped.map(g => ({ lat: g.coordinates.lat, lng: g.coordinates.lng }))

  return (
    <MapContainer center={[51.505, -0.09]} zoom={11} className="gym-leaflet-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {mapped.map(gym => (
        <Marker
          key={`${gym._id}-${gym._id === selectedId}`}
          position={[gym.coordinates.lat, gym.coordinates.lng]}
          icon={makePin(gym._id === selectedId, gym.brandColor)}
          eventHandlers={{ click: () => onSelect(gym._id) }}
        >
          <Popup className="gym-map-popup">
            <div style={{ width: 200 }}>
              {/* Gym identity row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: gym.brandColor || '#0a2463',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 18,
                }}>
                  {gym.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: '#111' }}>
                    {gym.name}
                  </div>
                  {(gym.city || gym.country) && (
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      {[gym.city, gym.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* View club button */}
              <button
                onClick={() => navigate(`/gyms/${gym.slug}`)}
                style={{
                  width: '100%', padding: '8px 0', border: 'none', borderRadius: 7, cursor: 'pointer',
                  background: gym.brandColor || '#e11d48', color: '#fff',
                  fontWeight: 600, fontSize: 13,
                }}
              >
                View Club
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
