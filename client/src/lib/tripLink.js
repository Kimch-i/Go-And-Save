// Builds and reads planner links that reopen a saved trip with the same places, vehicle and load.
export function plannerLinkForTrip(trip, extra = {}) {
  const params = new URLSearchParams({
    from: trip.originLabel,
    fromLat: trip.originLat,
    fromLon: trip.originLon,
    to: trip.destLabel,
    toLat: trip.destLat,
    toLon: trip.destLon,
    vehicle: trip.vehicleId,
    pax: trip.passengers,
    cargo: trip.cargoKg,
    round: trip.roundTrip ? '1' : '0',
    ...extra,
  });
  return '/?' + params.toString();
}

export function placeFromParams(params, prefix) {
  const label = params.get(prefix);
  const lat = Number(params.get(`${prefix}Lat`));
  const lon = Number(params.get(`${prefix}Lon`));
  if (!label || !lat || !lon) return null;
  return { label, lat, lon };
}
