export async function findByEmail(pool, email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] ?? null
}

export async function create(pool, { email, passwordHash, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, passwordHash, name]
  )
  return result.rows[0]
}

export async function remove(pool, userId) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId])
  return result.rowCount > 0
}