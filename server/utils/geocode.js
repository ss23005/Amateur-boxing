/**
 * Geocode a gym using Nominatim (OpenStreetMap).
 * Tries progressively simpler queries so building names that Nominatim
 * can't match don't block the postcode/city fallback.
 * Returns { lat, lng } or null if nothing was found.
 */
export async function geocodeGym({ address, city, postcode, country }) {
  const query = async (parts) => {
    if (!parts.length) return null
    const q = encodeURIComponent(parts.join(', '))
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'ABW-BoxingPlatform/1.0' } }
      )
      const data = await res.json()
      if (!data[0]) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    } catch {
      return null
    }
  }

  // 1. Full address
  const full = await query([address, city, postcode, country].filter(Boolean))
  if (full) return full

  // 2. Postcode + country (handles "building name" addresses Nominatim can't parse)
  if (postcode) {
    const byPostcode = await query([postcode, country].filter(Boolean))
    if (byPostcode) return byPostcode
  }

  // 3. City + country
  if (city) {
    const byCity = await query([city, country].filter(Boolean))
    if (byCity) return byCity
  }

  return null
}
