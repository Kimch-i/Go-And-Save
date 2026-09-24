// Calls the GAS Express API. Routes the server must provide:
//   GET /api/places?q=  GET /api/route?from=&to=  GET /api/prices  GET /api/cars?q=
//   GET+POST /api/vehicles  DELETE /api/vehicles/:id  GET+POST /api/trips  DELETE /api/account

import * as storage from '../services/storage.js';

const BASE = import.meta.env.VITE_API_BASE_URL || '';


async function request(path, options) {
  const token = storage.getSession()?.token;
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

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

export const listVehicles = () => request('/api/vehicles');

export const createVehicle = (input) =>
  request('/api/vehicles', { method: 'POST', body: JSON.stringify(input) });

export const deleteVehicle = (id) =>
  request(`/api/vehicles/${id}`, { method: 'DELETE' });

export const listTrips = () => request('/api/trips');

export const createTrip = (input) =>
  request('/api/trips', { method: 'POST', body: JSON.stringify(input) });

export const deleteAccountData = () => request('/api/account', { method: 'DELETE' });


export const signUp = (input) =>
  request('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) });

export const logIn = (input) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(input) });