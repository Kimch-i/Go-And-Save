// Place search for the Philippines. Tries Nominatim first (free, no key,
// but Render's shared free-tier IPs sometimes get rate-limited there).
// If that fails, falls back to LocationIQ, which gives us our own quota
// (5000 requests/day, 2/sec on the free plan) instead of a shared one.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const LOCATIONIQ_URL = 'https://us1.locationiq.com/v1/search.php'

let nextAllowedAt = 0

function waitForTurn() {
  const now = Date.now()
  const waitMs = Math.max(0, nextAllowedAt - now)
  nextAllowedAt = Math.max(now, nextAllowedAt) + 1000
  return new Promise((resolve) => setTimeout(resolve, waitMs))
}

async function searchNominatim(query) {
  await waitForTurn()

  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('countrycodes', 'ph')
  url.searchParams.set('limit', '5')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GAS-Gasolina-Advisory-System/1.0 (https://github.com/Kimch-i/Go-And-Save)',
    },
  })

  if (!response.ok) {
    throw new Error(`Nominatim responded ${response.status}`)
  }

  return response.json()
}

async function searchLocationIq(query) {
  const apiKey = process.env.LOCATIONIQ_KEY
  if (!apiKey) {
    throw new Error('LOCATIONIQ_KEY is not set')
  }

  const url = new URL(LOCATIONIQ_URL)
  url.searchParams.set('key', apiKey)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('countrycodes', 'ph')
  url.searchParams.set('limit', '5')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`LocationIQ responded ${response.status}`)
  }

  return response.json()
}

export async function searchPlaces(query) {
  let results

  try {
    results = await searchNominatim(query)
  } catch (error) {
    console.error('Nominatim search failed, falling back to LocationIQ:', error.message)
    results = await searchLocationIq(query)
  }

  return results.map((place) => ({
    label: place.display_name,
    lat: Number(place.lat),
    lon: Number(place.lon),
  }))
}