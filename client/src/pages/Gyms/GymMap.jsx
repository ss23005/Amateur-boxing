import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
})

const makePin = (active) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:30px;
      background:${active ? '#f97316' : '#e11d48'};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg) scale(${active ? '1.3' : '1'});
      border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize:    [22, 30],
    iconAnchor:  [11, 30],
    popupAnchor: [0, -32],
  })

function FitBounds({ points }) {
  const map = useMap()
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
  // Only show gyms that have coordinates stored in the DB
  const mapped = (gyms ?? []).filter(g => g.coordinates?.lat && g.coordinates?.lng)
  const points = mapped.map(g => ({ lat: g.coordinates.lat, lng: g.coordinates.lng }))

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
          icon={makePin(gym._id === selectedId)}
          eventHandlers={{ click: () => onSelect(gym._id) }}
        />
      ))}
    </MapContainer>
  )
}
