// The only file screens import data from. VITE_USE_MOCK_API=false switches mockApi.js for httpApi.js.

import * as mockApi from './mockApi.js';
import * as httpApi from './httpApi.js';

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

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
} = implementation;
