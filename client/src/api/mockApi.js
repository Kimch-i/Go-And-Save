// Demo-mode backend: routes, cars and prices from seed.json, saved vehicles and trips in localStorage.

import seed from './seed.json';

const KEYS = {
  vehicles: 'gas.mock.vehicles',
  trips: 'gas.mock.trips',
};

// false shows the no-traffic fallback (clear-road figure only)
const TRAFFIC_DATA_AVAILABLE = true;

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function seedTrips() {
  return seed.trips.map(({ daysAgo, ...trip }) => ({
    ...trip,
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  }));
}

function read(key, makeSeed) {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(key);
    }
  }
  const rows = makeSeed();
  localStorage.setItem(key, JSON.stringify(rows));
  return rows;
}

function write(key, rows) {
  localStorage.setItem(key, JSON.stringify(rows));
  return rows;
}

const readVehicles = () => read(KEYS.vehicles, () => seed.vehicles);
const readTrips = () => read(KEYS.trips, seedTrips);

export async function searchPlaces(query) {
  await delay(150);
  const q = query.trim().toLowerCase();
  return seed.places.filter((place) => place.label.toLowerCase().includes(q)).slice(0, 5);
}

export async function getRoute(origin, destination) {
  await delay(700);

  if (!origin || !destination || origin.label === destination.label) {
    throw new Error('No route found between these two places.');
  }

  const sample = seed.sampleRoutes[`${origin.label}|${destination.label}`]
              || seed.sampleRoutes[`${destination.label}|${origin.label}`];

  const distanceKm = sample ? sample.km : roadDistanceKm(origin, destination);
  const freeMin = sample ? sample.freeMin : Math.round((distanceKm / 45) * 60);
  const trafficMin = sample ? sample.trafficMin : Math.round(freeMin * 1.45);

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    freeFlowSeconds: freeMin * 60,
    trafficSeconds: TRAFFIC_DATA_AVAILABLE ? trafficMin * 60 : null,
    geometry: sketchGeometry(origin, destination),
  };
}

export async function listFuelPrices() {
  await delay();
  return seed.fuelPrices;
}

export async function searchCars(query) {
  await delay(100);
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return seed.cars
    .filter((car) => `${car.make} ${car.model}`.toLowerCase().includes(q))
    .slice(0, 6);
}

export async function listVehicles() {
  await delay();
  return readVehicles();
}

export async function createVehicle(input) {
  await delay();
  let vehicle;

  if (input.carModelId) {
    const car = seed.cars.find((c) => c.id === input.carModelId);
    if (!car) throw new Error('That car is not in the catalog.');
    vehicle = {
      id: Date.now(),
      nickname: input.nickname,
      carModelId: car.id,
      fuelType: car.fuelType,
      kmPerLiter: car.kmPerLiterCity,
      idleRateLph: car.idleRateLph,
      kerbWeightKg: car.kerbWeightKg,
    };
  } else {
    vehicle = {
      id: Date.now(),
      nickname: input.nickname,
      carModelId: null,
      fuelType: input.fuelType,
      kmPerLiter: input.kmPerLiter,
      idleRateLph: 0.7,
      kerbWeightKg: null,
    };
  }

  write(KEYS.vehicles, [...readVehicles(), vehicle]);
  return vehicle;
}

export async function deleteVehicle(id) {
  await delay();
  write(KEYS.vehicles, readVehicles().filter((vehicle) => vehicle.id !== id));
}

export async function listTrips() {
  await delay();
  return readTrips().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTrip(input) {
  await delay();
  const trip = { ...input, id: Date.now(), createdAt: new Date().toISOString() };
  write(KEYS.trips, [...readTrips(), trip]);
  return trip;
}

export async function deleteAccountData() {
  await delay();
  write(KEYS.vehicles, []);
  write(KEYS.trips, []);
}

function roadDistanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
          + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h)) * 1.3;
}

function sketchGeometry(a, b) {
  const points = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const bend = Math.sin(t * Math.PI) * 0.08;
    points.push([
      a.lat + (b.lat - a.lat) * t + (b.lon - a.lon) * bend,
      a.lon + (b.lon - a.lon) * t - (b.lat - a.lat) * bend,
    ]);
  }
  return points;
}
