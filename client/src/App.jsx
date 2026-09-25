// Routes, plus the state more than one screen needs: vehicles, fuel prices, theme and session.

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import AppLayout from './pages/AppLayout/AppLayout.jsx';
import TripPlannerPage from './pages/TripPlannerPage/TripPlannerPage.jsx';
import VehiclesPage from './pages/VehiclesPage/VehiclesPage.jsx';
import AddVehiclePage from './pages/AddVehiclePage/AddVehiclePage.jsx';
import PricesPage from './pages/PricesPage/PricesPage.jsx';
import TripsPage from './pages/TripsPage/TripsPage.jsx';
import AuthPage from './pages/AuthPage/AuthPage.jsx';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';
import {
  listFuelPrices, listVehicles, createVehicle, deleteVehicle, deleteAccountData,
  updateAccount, migrateGuestVehicles,
} from './api/index.js';
import * as storage from './services/storage.js';
import { applyTheme } from './lib/theme.js';

export default function App() {
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [fuelPrices, setFuelPrices] = useState([]);
  const [session, setSession] = useState(storage.getSession);
  const [themeChoice, setThemeChoice] = useState(storage.getThemeChoice);
  const [theme, setTheme] = useState(() => applyTheme(storage.getThemeChoice()));

  const token = session?.token;

  // Runs on load and again whenever someone logs in or out, so the list always
  // belongs to whoever is using the app: a guest's cars in this browser, or the
  // account's cars from the server. finally() ends the spinner even on an error.
  useEffect(() => {
    setVehiclesLoading(true);
    listVehicles()
      .then(setVehicles)
      .catch((error) => {
        console.error('Could not load vehicles:', error.message);
        setVehicles([]);
      })
      .finally(() => setVehiclesLoading(false));
  }, [token]);

  useEffect(() => {
    listFuelPrices().then(setFuelPrices).catch(() => setFuelPrices([]));
  }, []);

  // httpApi.js sends this when the server rejects an expired token.
  useEffect(() => {
    const handleLoggedOut = () => setSession(null);
    window.addEventListener('gas:logged-out', handleLoggedOut);
    return () => window.removeEventListener('gas:logged-out', handleLoggedOut);
  }, []);

  function changeTheme(choice) {
    setTheme(applyTheme(choice));
    setThemeChoice(choice);
    storage.saveThemeChoice(choice);
  }

  function toggleTheme() {
    changeTheme(theme === 'dark' ? 'light' : 'dark');
  }

  async function addVehicle(input) {
    const vehicle = await createVehicle(input);
    setVehicles((current) => [...current, vehicle]);

    const prefs = storage.getPrefs();
    storage.savePrefs({ lastVehicleId: vehicle.id, defaultVehicleId: prefs.defaultVehicleId || vehicle.id });
    return vehicle;
  }

  async function removeVehicle(id) {
    await deleteVehicle(id);
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));

    const prefs = storage.getPrefs();
    storage.savePrefs({
      defaultVehicleId: prefs.defaultVehicleId === id ? null : prefs.defaultVehicleId,
      lastVehicleId: prefs.lastVehicleId === id ? null : prefs.lastVehicleId,
    });
  }

  // Save the token first, because moving the guest's cars needs it. Only then
  // update state, so the vehicle list reloads after the cars have moved.
  // Returns the old-id to new-id map for a trip held during login.
  async function logIn(user, newToken, remember) {
    storage.saveSession({ name: user.name, email: user.email, token: newToken }, remember);
    let idMap = {};
    try {
      idMap = await migrateGuestVehicles();
    } catch (error) {
      // The cars stay in the browser and move on the next login instead.
      console.error('Could not move guest vehicles:', error.message);
    }
    setSession(storage.getSession());
    return idMap;
  }

  async function changeAccount(name, email) {
    const user = await updateAccount({ name, email });
    storage.updateSession({ name: user.name, email: user.email });
    setSession(storage.getSession());
  }

  function logOut() {
    storage.clearSession();
    setSession(null);
  }

  async function deleteAccount() {
    await deleteAccountData();
    storage.clearAll();
    setSession(null);
    setVehicles([]);
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/auth" element={<AuthPage session={session} vehicles={vehicles} onLogIn={logIn} />} />

        <Route element={<AppLayout session={session} theme={theme} onToggleTheme={toggleTheme} />}>
          <Route
            index
            element={
              <TripPlannerPage
                vehicles={vehicles}
                vehiclesLoading={vehiclesLoading}
                fuelPrices={fuelPrices}
                session={session}
                theme={theme}
              />
            }
          />
          <Route
            path="vehicles"
            element={<VehiclesPage vehicles={vehicles} vehiclesLoading={vehiclesLoading} onRemoveVehicle={removeVehicle} />}
          />
          <Route path="vehicles/add" element={<AddVehiclePage onAddVehicle={addVehicle} />} />
          <Route path="prices" element={<PricesPage fuelPrices={fuelPrices} />} />
          <Route path="trips" element={<TripsPage vehicles={vehicles} session={session} />} />
          <Route
            path="profile"
            element={
              <ProfilePage
                session={session}
                vehicles={vehicles}
                themeChoice={themeChoice}
                onThemeChange={changeTheme}
                onUpdateAccount={changeAccount}
                onLogOut={logOut}
                onDeleteAccount={deleteAccount}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
