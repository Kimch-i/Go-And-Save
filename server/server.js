import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as carModels from './db/carModelsRepo.js'
import * as fuelPrices from './db/fuelPricesRepo.js'
import { searchPlaces } from './nominatim.js'
import { getRoute } from './tomtom.js'
import * as users from './db/usersRepo.js'
import { hashPassword, checkPassword, signToken } from './auth.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

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

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})