// Checks request bodies on the server, because the browser can be bypassed.
// Each function returns a list of problems. An empty list means the input is fine.

const FUEL_TYPES = ['gasoline', 'diesel']

function isText(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function isNumberBetween(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

export function vehicleErrors(body) {
  const errors = []
  if (!isText(body.nickname, 60)) errors.push('nickname is required, up to 60 characters')

  // A catalog car brings its own specs, looked up on the server.
  if (body.carModelId != null) {
    if (!Number.isInteger(body.carModelId)) errors.push('carModelId must be a whole number')
    return errors
  }

  if (!FUEL_TYPES.includes(body.fuelType)) errors.push('fuelType must be gasoline or diesel')
  if (!isNumberBetween(body.kmPerLiter, 1, 100)) errors.push('kmPerLiter must be a number from 1 to 100')
  if (body.idleRateLph != null && !isNumberBetween(body.idleRateLph, 0, 5)) {
    errors.push('idleRateLph must be a number from 0 to 5')
  }
  return errors
}

export function tripErrors(body) {
  const errors = []
  if (!isText(body.originLabel, 300)) errors.push('originLabel is required')
  if (!isText(body.destLabel, 300)) errors.push('destLabel is required')

  for (const key of ['originLat', 'destLat']) {
    if (!isNumberBetween(body[key], -90, 90)) errors.push(`${key} must be a latitude`)
  }
  for (const key of ['originLon', 'destLon']) {
    if (!isNumberBetween(body[key], -180, 180)) errors.push(`${key} must be a longitude`)
  }
  for (const key of ['distanceKm', 'cargoKg', 'idealLiters', 'idealCost', 'actualLiters', 'actualCost']) {
    if (!isNumberBetween(body[key], 0, 100000)) errors.push(`${key} must be a number, 0 or more`)
  }

  // Traffic can occasionally be faster than free flow, so delay may be negative.
  if (!isNumberBetween(body.delayMinutes, -10000, 10000)) errors.push('delayMinutes must be a number')
  if (!Number.isInteger(body.passengers) || body.passengers < 1 || body.passengers > 20) {
    errors.push('passengers must be a whole number from 1 to 20')
  }
  if (typeof body.roundTrip !== 'boolean') errors.push('roundTrip must be true or false')
  if (body.vehicleId != null && !Number.isInteger(body.vehicleId)) errors.push('vehicleId must be a whole number')
  return errors
}

export function accountErrors(body) {
  const errors = []
  if (!isText(body.name, 100)) errors.push('Enter your name.')
  if (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email.trim())) errors.push('Enter a valid email.')
  return errors
}
