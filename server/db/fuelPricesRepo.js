export async function getAll(pool) {
    const result = await pool.query(
        `SELECT * FROM fuel_prices ORDER BY week_of DESC`
    )

    return result.rows
}