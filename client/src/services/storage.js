// What stays in the browser: theme, preferences, a trip held during login, and the stand-in session.
const KEYS = {
  session: 'gas.session',
  prefs: 'gas.prefs',
  pendingTrip: 'gas.pendingTrip',
  theme: 'gas.theme',
};

const DEFAULT_PREFS = {
  defaultVehicleId: null,
  lastVehicleId: null,
  home: { label: 'Porac, Pampanga', lat: 15.0719, lon: 120.5420 },
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
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
  return read(KEYS.session, null);
}

export function saveSession(session) {
  write(KEYS.session, session);
}

export function clearSession() {
  remove(KEYS.session);
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
  [KEYS.session, KEYS.prefs, KEYS.pendingTrip].forEach(remove);
}
