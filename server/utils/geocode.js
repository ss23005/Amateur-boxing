/**
 * Geocode a gym using Nominatim (OpenStreetMap).
 * Builds the best possible query from whatever fields are available.
 * Returns { lat, lng } or null if nothing was found.
 */
export async function geocodeGym({ name, address, city, country }) {
  // Build query from most-specific to least-specific
  const parts = [address, city, country].filter(Boolean)
  if (!parts.length) return null

  const q = encodeURIComponent(parts.join(', '))
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'ABW-BoxingPlatform/1.0 (amateur-boxing-world)',
      },
    })
    const data = await res.json()
    if (!data[0]) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
