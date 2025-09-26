const AUTH_STORAGE_KEY = 'amaeats_auth_v1';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readAuth() {
  if (!isBrowser()) return null;
  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to parse stored auth payload', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeAuth(auth) {
  if (!isBrowser()) return;
  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredUser() {
  return readAuth()?.user ?? null;
}

export function getAuthToken() {
  return readAuth()?.token ?? null;
}
