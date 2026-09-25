import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import TextInput from '../../components/atoms/TextInput/TextInput.jsx';
import Select from '../../components/atoms/Select/Select.jsx';
import Button from '../../components/atoms/Button/Button.jsx';
import PillToggle from '../../components/molecules/PillToggle/PillToggle.jsx';
import LocationSearch from '../../components/molecules/LocationSearch/LocationSearch.jsx';
import * as storage from '../../services/storage.js';
import { listTrips } from '../../api/index.js';
import { plural } from '../../lib/format.js';
import styles from './ProfilePage.module.css';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

function tripsToCsv(trips) {
  const header = ['created_at', 'origin', 'destination', 'distance_km', 'passengers', 'cargo_kg',
    'ideal_liters', 'ideal_cost', 'actual_liters', 'actual_cost', 'delay_minutes', 'round_trip'];
  const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = trips.map((t) => [
    t.createdAt, t.originLabel, t.destLabel, t.distanceKm, t.passengers, t.cargoKg,
    t.idealLiters.toFixed(2), t.idealCost.toFixed(2), t.actualLiters.toFixed(2), t.actualCost.toFixed(2),
    t.delayMinutes, t.roundTrip,
  ].map(quote).join(','));
  return [header.join(','), ...rows].join('\n');
}

// Account, theme, default vehicle, home location, CSV export, delete account.
export default function ProfilePage({
  session, vehicles, themeChoice, onThemeChange, onUpdateAccount, onLogOut, onDeleteAccount,
}) {
  const navigate = useNavigate();
  const [name, setName] = useState(session ? session.name : '');
  const [email, setEmail] = useState(session ? session.email : '');
  const [accountStatus, setAccountStatus] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [prefs, setPrefs] = useState(storage.getPrefs);
  const [leaving, setLeaving] = useState(false);
  const [tripCount, setTripCount] = useState(null);
  const [homeStatus, setHomeStatus] = useState('');

  useEffect(() => {
    listTrips().then((trips) => setTripCount(trips.length)).catch(() => {});
  }, []);

  if (!session) {
    return leaving ? null : <Navigate to="/auth" replace />;
  }

  // Saved on the server, so the new name is still there at the next login.
  async function saveAccount(event) {
    event.preventDefault();
    if (!name.trim() || !email.includes('@')) {
      setAccountStatus('Enter a name and a valid email.');
      return;
    }
    try {
      await onUpdateAccount(name.trim(), email.trim());
      setAccountStatus('Changes saved.');
    } catch (error) {
      setAccountStatus(error.message);
    }
  }

  function changePref(changes) {
    storage.savePrefs(changes);
    setPrefs(storage.getPrefs());
  }

  async function exportCsv() {
    const blob = new Blob([tripsToCsv(await listTrips())], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gas-trips.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function logOut() {
    setLeaving(true);
    onLogOut();
    navigate('/');
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your account, vehicles and saved trips? This cannot be undone.')) return;
    setLeaving(true);
    await onDeleteAccount();
    navigate('/');
  }

  return (
    <>
      <h1>Profile</h1>

      <div className={styles.columns}>
        <div>
          <section className={styles.group} aria-labelledby="account-title">
            <h2 id="account-title">Account</h2>
            <form onSubmit={saveAccount} noValidate>
              <TextInput label="Your name" id="profile-name" value={name} onChange={setName} autoComplete="name" />
              <TextInput label="Email" id="profile-email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Button variant="ghost" type="submit">Save changes</Button>
              <p className={styles.status} role="status">{accountStatus}</p>
            </form>
          </section>

          <section className={styles.group} aria-labelledby="password-title">
            <h2 id="password-title">Password</h2>
            <Button variant="ghost" onClick={() => setPasswordStatus('Changing your password is not available yet.')}>
              Change password
            </Button>
            <p className={styles.status} role="status">{passwordStatus}</p>
          </section>
        </div>

        <div>
          <section className={styles.group} aria-labelledby="prefs-title">
            <h2 id="prefs-title">Preferences</h2>

            <div className={styles.field}>
              <p className={styles.label} aria-hidden="true">Theme</p>
              <PillToggle label="Theme" options={THEMES} value={themeChoice} onChange={onThemeChange} />
            </div>

            <Select
              label="Default vehicle"
              id="default-vehicle"
              value={prefs.defaultVehicleId ?? ''}
              disabled={vehicles.length === 0}
              onChange={(id) => changePref({ defaultVehicleId: Number(id), lastVehicleId: Number(id) })}
            >
              {vehicles.length === 0 && <option value="">No vehicles yet</option>}
              {vehicles.length > 0 && prefs.defaultVehicleId === null && <option value="">Choose one</option>}
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname}</option>
              ))}
            </Select>

            <LocationSearch
              label="Home location"
              id="home-location"
              place={prefs.home}
              placeholder="Where do your trips usually start?"
              onSelect={(place) => {
                changePref({ home: place });
                setHomeStatus(`Saved. The planner starts from ${place.label}.`);
              }}
              onClear={() => setHomeStatus('')}
            />
            <p className={styles.status} role="status">{homeStatus || 'The planner starts from here.'}</p>
          </section>

          <section className={styles.group} aria-labelledby="data-title">
            <h2 id="data-title">Your data</h2>
            <p className={styles.summary}>
              {plural(vehicles.length, 'vehicle')}
              {tripCount !== null && `, ${plural(tripCount, 'saved trip')}`}
            </p>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={exportCsv}>Export as CSV</Button>
              <Button variant="ghost" onClick={logOut}>Log out</Button>
              <Button variant="danger" onClick={deleteAccount}>Delete account</Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
