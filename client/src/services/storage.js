// What stays in the browser: theme, preferences, the login session, a trip held
// during login, and the cars a guest saves before they have an account.
const KEYS = {
  session: 'gas.session',
  prefs: 'gas.prefs',
  pendingTrip: 'gas.pendingTrip',
  theme: 'gas.theme',
  guestVehicles: 'gas.guestVehicles',
};

const DEFAULT_PREFS = {
  defaultVehicleId: null,
  lastVehicleId: null,
  home: { label: 'Porac, Pampanga', lat: 15.0719, lon: 120.5420 },
};

// localStorage survives closing the browser; sessionStorage is wiped when the
// tab closes. "Remember me" picks between them for the login session.
function area(name) {
  return name === 'session' ? sessionStorage : localStorage;
}

function read(key, fallback, where = 'local') {
  try {
    const raw = area(where).getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function write(key, value, where = 'local') {
  try {
    area(where).setItem(key, JSON.stringify(value));
  } catch (error) {
  }
}

function remove(key, where = 'local') {
  try {
    area(where).removeItem(key);
  } catch (error) {
  }
}

export function setPendingTrip(trip) {
  write(KEYS.pendingTrip, trip);
}

export function takePendingTrip() {
  const trip = read(KEYS.pendingTrip, null);
  remove(KEYS.pendingTrip);
  return trip;
}

export function getSession() {
  return read(KEYS.session, null) || read(KEYS.session, null, 'session');
}

export function saveSession(session, remember = true) {
  clearSession();
  write(KEYS.session, session, remember ? 'local' : 'session');
}

// Change the name or email without moving the session to the other storage.
export function updateSession(changes) {
  const current = getSession();
  if (!current) return;
  const remembered = read(KEYS.session, null) !== null;
  saveSession({ ...current, ...changes }, remembered);
}

export function clearSession() {
  remove(KEYS.session);
  remove(KEYS.session, 'session');
}

export function getGuestVehicles() {
  return read(KEYS.guestVehicles, []);
}

export function saveGuestVehicles(vehicles) {
  write(KEYS.guestVehicles, vehicles);
}

export function getPrefs() {
  return { ...DEFAULT_PREFS, ...read(KEYS.prefs, {}) };
}

export function savePrefs(changes) {
  write(KEYS.prefs, { ...getPrefs(), ...changes });
}

export function getThemeChoice() {
  try {
    return localStorage.getItem(KEYS.theme) || 'system';
  } catch (error) {
    return 'system';
  }
}

export function saveThemeChoice(choice) {
  try {
    localStorage.setItem(KEYS.theme, choice);
  } catch (error) {
  }
}

export function clearAll() {
  clearSession();
  [KEYS.prefs, KEYS.pendingTrip, KEYS.guestVehicles].forEach((key) => remove(key));
}
