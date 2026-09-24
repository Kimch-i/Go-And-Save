export async function search(pool, query) {
    const result = await pool.query(
        `SELECT * FROM car_models
        WHERE (make || ' ' || model) ILIKE $1
        ORDER BY make, model
        LIMIT 6`, [`%${query}%`]
    )

    return result.rows
}