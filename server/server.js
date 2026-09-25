import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as carModels from './db/carModelsRepo.js'
import * as fuelPrices from './db/fuelPricesRepo.js'
import * as users from './db/usersRepo.js'
import * as vehicles from './db/vehiclesRepo.js'
import * as trips from './db/tripsRepo.js'
import { searchPlaces } from './nominatim.js'
import { getRoute } from './tomtom.js'
import { hashPassword, checkPassword, signToken, requireAuth } from './auth.js'
import { camelCaseRow, camelCaseRows } from './caseConvert.js'
import { vehicleErrors, tripErrors, accountErrors } from './validate.js'

const app = express()

// CORS before the routes. Middleware registered after a route never sees that
// route's requests.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser.
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

// Rows come out of Postgres in snake_case; the client expects camelCase, so
// every route that returns real database rows converts at this boundary.
app.get('/api/prices', async (request, response, next) => {
  try {
    response.json(camelCaseRows(await fuelPrices.getAll(pool)))
  } catch (error) {
    next(error)
  }
})

app.get('/api/cars', async (request, response, next) => {
  try {
    const q = typeof request.query.q === 'string' ? request.query.q.trim() : ''
    response.json(q ? camelCaseRows(await carModels.search(pool, q)) : [])
  } catch (error) {
    next(error)
  }
})

// Nominatim and TomTom already hand-build camelCase objects, so these two need
// no conversion.
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

app.post('/api/auth/signup', async (request, response, next) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''

  if (!/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ error: 'Enter a valid email.' })
  if (password.length < 8) return response.status(400).json({ error: 'Password must be at least 8 characters.' })
  if (!name) return response.status(400).json({ error: 'Enter your name.' })

  try {
    if (await users.findByEmail(pool, email)) {
      return response.status(409).json({ error: 'An account with that email already exists.' })
    }
    const passwordHash = await hashPassword(password)
    const user = await users.create(pool, { email, passwordHash, name })
    response.status(201).json({ token: signToken(user.id), user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    // Two signups for the same email landing at once race past the check
    // above; the database's UNIQUE constraint is the real guard.
    if (error.code === '23505') return response.status(409).json({ error: 'An account with that email already exists.' })
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''

  try {
    const user = await users.findByEmail(pool, email)
    const valid = user && (await checkPassword(password, user.password_hash))
    if (!valid) return response.status(401).json({ error: 'Wrong email or password.' })

    response.json({ token: signToken(user.id), user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    next(error)
  }
})

// requireAuth runs before each handler below. A missing or expired token gets
// a 401 and the handler never runs.
app.get('/api/vehicles', requireAuth, async (request, response, next) => {
  try {
    response.json(camelCaseRows(await vehicles.listForUser(pool, request.userId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/vehicles', requireAuth, async (request, response, next) => {
  const body = request.body ?? {}
  const errors = vehicleErrors(body)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })

  try {
    const vehicle = await vehicles.create(pool, request.userId, body)
    if (!vehicle) return response.status(400).json({ error: 'That car is not in the catalog.' })
    response.status(201).json(camelCaseRow(vehicle))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/vehicles/:id', requireAuth, async (request, response, next) => {
  // "abc" is not an id Postgres can compare, so answer before asking it.
  if (!/^\d+$/.test(request.params.id)) return response.status(404).json({ error: 'Not found' })

  try {
    const removed = await vehicles.remove(pool, request.userId, request.params.id)
    if (!removed) return response.status(404).json({ error: 'Not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/trips', requireAuth, async (request, response, next) => {
  try {
    response.json(camelCaseRows(await trips.listForUser(pool, request.userId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/trips', requireAuth, async (request, response, next) => {
  const body = request.body ?? {}
  const errors = tripErrors(body)
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })

  try {
    const trip = await trips.create(pool, request.userId, body)
    response.status(201).json(camelCaseRow(trip))
  } catch (error) {
    next(error)
  }
})

// Change the name or email on the account.
app.put('/api/account', requireAuth, async (request, response, next) => {
  const body = request.body ?? {}
  const errors = accountErrors(body)
  if (errors.length > 0) return response.status(400).json({ error: errors.join(' ') })

  try {
    const user = await users.update(pool, request.userId, {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
    })
    if (!user) return response.status(401).json({ error: 'Your account no longer exists. Log in again.' })
    response.json(user)
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ error: 'An account with that email already exists.' })
    next(error)
  }
})

// Deleting the user cascades to their vehicles and trips, because both
// foreign keys are ON DELETE CASCADE in schema.sql.
app.delete('/api/account', requireAuth, async (request, response, next) => {
  try {
    await users.remove(pool, request.userId)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  // A token can outlive its account: it stays valid for 7 days even after the
  // account is deleted. Saving then breaks the user_id foreign key. That is a
  // login problem, not a server fault, so say so.
  if (error.code === '23503' && error.constraint?.endsWith('_user_id_fkey')) {
    return response.status(401).json({ error: 'Your account no longer exists. Log in again.' })
  }

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