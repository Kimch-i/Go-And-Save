import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const TOKEN_EXPIRY = '7d'

// Same idea as DATABASE_URL in db/pool.js: without a secret no token can be
// signed, so stop at boot with a clear message instead of failing every login.
if (!process.env.JWT_SECRET) {
  console.error(
    'JWT_SECRET is not set. Locally: add it to server/.env. ' +
    'On a host: add it in the dashboard, then redeploy.'
  )
  process.exit(1)
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function checkPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

// Reads "Authorization: Bearer <token>", verifies it, and attaches the user's id to the request
export function requireAuth(request, response, next) {
  const [scheme, token] = (request.headers.authorization || '').split(' ')

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ error: 'Log in required' })
  }

  try {
    request.userId = jwt.verify(token, process.env.JWT_SECRET).sub
    next()
  } catch {
    response.status(401).json({ error: 'Session expired, log in again' })
  }
}