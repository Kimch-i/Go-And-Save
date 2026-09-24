import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as carModels from './db/carModelsRepo.js'
import * as fuelPrices from './db/fuelPricesRepo.js'
import { searchPlaces } from './nominatim.js'
import { getRoute } from './tomtom.js'

const app = express()

// CORS before the routes. Middleware registered after a route never sees that
// route's requests, which is the m4 lesson showing up in production.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser, and is incompatible with cookies.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

// Is the process alive?
app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

// Is the database reachable? A different question, and the one that tells you
// in two seconds which half of a problem you have.
app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

app.get('/api/prices', async (request, response, next) => {
  try {
    response.json(await fuelPrices.getAll(pool))
  } catch (error) {
    next(error)
  }
})

app.get('/api/cars', async (request, response, next) => {
  try {
    const q = typeof request.query.q === 'string' ? request.query.q.trim() : ''
    response.json(q ? await carModels.search(pool, q) : [])
  } catch (error) {
    next(error)
  }
})

app.get('/api/places', async (request, response, next) => {
  const q = typeof request.query.q === 'string' ? request.query.q.trim() : ''
  if (!q) return response.json([])

  try {
    response.json(await searchPlaces(q))
  } catch (error) {
    console.error('Nominatim search failed:', error.message)
    response.status(502).json({ error: 'Place search is unavailable right now' })
  }
})

function parseCoords(value) {
  if (typeof value !== 'string') return null
  const [lat, lon] = value.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { lat, lon }
}

app.get('/api/route', async (request, response) => {
  const origin = parseCoords(request.query.from)
  const destination = parseCoords(request.query.to)

  if (!origin || !destination) {
    return response.status(400).json({ error: 'from and to must be "lat,lon"' })
  }

  try {
    response.json(await getRoute(origin, destination))
  } catch (error) {
    console.error('Route lookup failed:', error.message)
    response.status(502).json({ error: 'No route found between these two places.' })
  }
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})