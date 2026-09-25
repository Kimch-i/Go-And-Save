export async function listForUser(pool, userId) {
  const result = await pool.query(
    'SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows
}

export async function create(pool, userId, trip) {
  const result = await pool.query(
    `INSERT INTO trips
       (user_id, origin_label, origin_lat, origin_lon, dest_label, dest_lat, dest_lon,
        distance_km, vehicle_id, passengers, cargo_kg, ideal_liters, ideal_cost,
        actual_liters, actual_cost, delay_minutes, round_trip)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      userId, trip.originLabel, trip.originLat, trip.originLon,
      trip.destLabel, trip.destLat, trip.destLon, trip.distanceKm,
      trip.vehicleId ?? null, trip.passengers, trip.cargoKg,
      trip.idealLiters, trip.idealCost, trip.actualLiters, trip.actualCost,
      trip.delayMinutes, trip.roundTrip,
    ]
  )
  return result.rows[0]
}