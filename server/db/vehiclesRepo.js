export async function listForUser(pool, userId) {
  const result = await pool.query(
    'SELECT * FROM vehicles WHERE user_id = $1 ORDER BY id',
    [userId]
  )
  return result.rows
}

// A catalog car copies its specs from car_models, so the numbers come from our
// data, not from whatever the browser sent. A manual car uses the figures the
// user typed, with a default idle burn of 0.7 L/hr (a mid-size car).
// Returns null if carModelId does not match a catalog car.
export async function create(pool, userId, input) {
  let specs = {
    fuelType: input.fuelType,
    kmPerLiter: input.kmPerLiter,
    idleRateLph: input.idleRateLph ?? 0.7,
    kerbWeightKg: null,
  }

  if (input.carModelId != null) {
    const found = await pool.query('SELECT * FROM car_models WHERE id = $1', [input.carModelId])
    const car = found.rows[0]
    if (!car) return null
    specs = {
      fuelType: car.fuel_type,
      kmPerLiter: car.km_per_liter_city,
      idleRateLph: car.idle_rate_lph,
      kerbWeightKg: car.kerb_weight_kg,
    }
  }

  const result = await pool.query(
    `INSERT INTO vehicles
       (user_id, nickname, car_model_id, fuel_type, km_per_liter, idle_rate_lph, kerb_weight_kg)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, input.nickname.trim(), input.carModelId ?? null, specs.fuelType,
     specs.kmPerLiter, specs.idleRateLph, specs.kerbWeightKg]
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
