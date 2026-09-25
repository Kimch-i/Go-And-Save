function toCamel(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function camelCaseRow(row) {
  if (row == null) return row
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [toCamel(key), value])
  )
}

export function camelCaseRows(rows) {
  return rows.map(camelCaseRow)
}