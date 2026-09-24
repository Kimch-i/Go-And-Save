// Nominatim is used to search for places in the Philippines
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function searchPlaces(query) {
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('countrycodes', 'ph')   // GAS is Philippines-only
  url.searchParams.set('limit', '5')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GAS-Gasolina-Advisory-System/1.0 (https://github.com/Kimch-i/Go-And-Save)',
    },
  })

  if (!response.ok) {
    throw new Error(`Nominatim responded ${response.status}`)
  }

  const results = await response.json()

  return results.map((place) => ({
    label: place.display_name,
    lat: Number(place.lat),
    lon: Number(place.lon),
  }))
}