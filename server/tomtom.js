// Get route and traffic information from TomTom.
const TOMTOM_URL = 'https://api.tomtom.com/routing/1/calculateRoute'

// Convert a location into TomTom's coordinate format.
function toPoint(place) {
  return `${place.lat},${place.lon}`
}

async function callTomTom(origin, destination, { withTraffic }) {
  const path = `${toPoint(origin)}:${toPoint(destination)}`
  const url = new URL(`${TOMTOM_URL}/${path}/json`)
  url.searchParams.set('key', process.env.TOMTOM_API_KEY)
  url.searchParams.set('traffic', String(withTraffic))
  if (withTraffic) url.searchParams.set('computeTravelTimeFor', 'all')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`TomTom responded ${response.status}`)
  }
  return response.json()
}

// Convert TomTom's response into the data used by the app.
function toRouteResult(data, { trafficSeconds }) {
  const summary = data.routes[0].summary
  return {
    distanceKm: Math.round((summary.lengthInMeters / 1000) * 10) / 10,
    freeFlowSeconds: trafficSeconds === null ? summary.travelTimeInSeconds : summary.noTrafficTravelTimeInSeconds,
    trafficSeconds: trafficSeconds === null ? null : summary.travelTimeInSeconds,
    geometry: data.routes[0].legs[0].points.map((p) => [p.latitude, p.longitude]),
  }
}

export async function getRoute(origin, destination) {
  try {
    const data = await callTomTom(origin, destination, { withTraffic: true })
    return toRouteResult(data, { trafficSeconds: data.routes[0].summary.travelTimeInSeconds })
  } catch (trafficError) {
    console.error('TomTom traffic call failed, falling back to no-traffic route:', trafficError.message)
    const data = await callTomTom(origin, destination, { withTraffic: false })
    return toRouteResult(data, { trafficSeconds: null })
  }
}