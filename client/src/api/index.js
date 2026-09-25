// The only file screens import data from. VITE_USE_MOCK_API=false switches mockApi.js for httpApi.js.

import * as mockApi from './mockApi.js';
import * as httpApi from './httpApi.js';

// Only the exact text "false" turns demo mode off.
export function isMockMode(value) {
  return value !== 'false';
}

export const USING_MOCK_API = isMockMode(import.meta.env.VITE_USE_MOCK_API);

const implementation = USING_MOCK_API ? mockApi : httpApi;

export const {
  searchPlaces,
  getRoute,
  listFuelPrices,
  searchCars,
  listVehicles,
  createVehicle,
  deleteVehicle,
  listTrips,
  createTrip,
  deleteAccountData,
  signUp,
  logIn,
  updateAccount,
  migrateGuestVehicles,
} = implementation;
