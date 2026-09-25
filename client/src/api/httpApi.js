// Calls the GAS Express API. Routes the server provides:
//   GET /api/places?q=  GET /api/route?from=&to=  GET /api/prices  GET /api/cars?q=
//   POST /api/auth/signup  POST /api/auth/login
//   GET+POST /api/vehicles  DELETE /api/vehicles/:id  GET+POST /api/trips
//   PUT+DELETE /api/account
//
// A guest has no account, so their cars live in this browser (services/storage.js)
// until they sign up or log in. Then migrateGuestVehicles moves them to the server.

import * as storage from '../services/storage.js';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

const isLoggedIn = () => Boolean(storage.getSession()?.token);

async function request(path, options) {
  const token = storage.getSession()?.token;
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  // We sent a token and the server refused it: it expired, or the account was
  // deleted. Log out here, and tell App.jsx so the screen updates too.
  if (response.status === 401 && token) {
    storage.clearSession();
    window.dispatchEvent(new Event('gas:logged-out'));
    throw new Error('Your session has ended. Please log in again.');
  }

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

const coords = (place) => `${place.lat},${place.lon}`;

export const searchPlaces = (query) =>
  request(`/api/places?q=${encodeURIComponent(query)}`);

export const getRoute = (origin, destination) =>
  request(`/api/route?from=${coords(origin)}&to=${coords(destination)}`);

export const listFuelPrices = () => request('/api/prices');

export const searchCars = (query) =>
  request(`/api/cars?q=${encodeURIComponent(query)}`);

export async function listVehicles() {
  if (!isLoggedIn()) return storage.getGuestVehicles();
  return request('/api/vehicles');
}

export async function createVehicle(input) {
  if (isLoggedIn()) {
    return request('/api/vehicles', { method: 'POST', body: JSON.stringify(input) });
  }

  const vehicle = {
    id: Date.now(),
    nickname: input.nickname,
    carModelId: input.carModelId ?? null,
    fuelType: input.fuelType,
    kmPerLiter: input.kmPerLiter,
    idleRateLph: input.idleRateLph ?? 0.7,
    kerbWeightKg: input.kerbWeightKg ?? null,
  };
  storage.saveGuestVehicles([...storage.getGuestVehicles(), vehicle]);
  return vehicle;
}

export async function deleteVehicle(id) {
  if (isLoggedIn()) return request(`/api/vehicles/${id}`, { method: 'DELETE' });
  storage.saveGuestVehicles(storage.getGuestVehicles().filter((vehicle) => vehicle.id !== id));
  return null;
}

// Guests cannot save trips; the planner sends them to log in first.
export async function listTrips() {
  if (!isLoggedIn()) return [];
  return request('/api/trips');
}

export const createTrip = (input) =>
  request('/api/trips', { method: 'POST', body: JSON.stringify(input) });

export async function deleteAccountData() {
  if (!isLoggedIn()) {
    storage.saveGuestVehicles([]);
    return null;
  }
  return request('/api/account', { method: 'DELETE' });
}

export const updateAccount = (input) =>
  request('/api/account', { method: 'PUT', body: JSON.stringify(input) });

export const signUp = (input) =>
  request('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) });

export const logIn = (input) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(input) });

// Runs right after login. Sends each car the guest saved in this browser to the
// server, one at a time, removing it from the browser once it is saved, so a
// failure halfway never creates duplicates on the next try.
// Returns { oldBrowserId: newServerId } so a trip held during login can point
// at the right car.
export async function migrateGuestVehicles() {
  const idMap = {};
  for (const vehicle of storage.getGuestVehicles()) {
    const saved = await request('/api/vehicles', { method: 'POST', body: JSON.stringify(vehicle) });
    idMap[vehicle.id] = saved.id;
    storage.saveGuestVehicles(storage.getGuestVehicles().filter((g) => g.id !== vehicle.id));
  }
  return idMap;
}
