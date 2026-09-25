export async function listForUser(pool, userId) {
  const result = await pool.query(
    'SELECT * FROM vehicles WHERE user_id = $1 ORDER BY id',
    [userId]
  )
  return result.rows
}

export async function create(pool, userId, { nickname, carModelId, fuelType, kmPerLiter, idleRateLph, kerbWeightKg }) {
  const result = await pool.query(
    `INSERT INTO vehicles
       (user_id, nickname, car_model_id, fuel_type, km_per_liter, idle_rate_lph, kerb_weight_kg)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, nickname, carModelId ?? null, fuelType, kmPerLiter, idleRateLph, kerbWeightKg ?? null]
  )
  return result.rows[0]
}

export async function remove(pool, userId, id) {
  // Only delete a vehicle if it belongs to the logged-in user
  const result = await pool.query(
    'DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  )
  return result.rowCount > 0
}