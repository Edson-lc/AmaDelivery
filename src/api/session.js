const AUTH_STORAGE_KEY = 'amaeats_session_v2';

const memoryState = {
  value: null,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function getStorage() {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('Unable to access sessionStorage', error);
    return null;
  }
}

function sanitizeAuth(auth) {
  if (!auth) {
    return null;
  }

  const normalized = {
    user: auth.user ?? null,
  };

  if (typeof auth.expiresAt === 'number') {
    normalized.expiresAt = auth.expiresAt;
  }

  return normalized;
}

export function readAuth() {
  const storage = getStorage();
  const fallback = memoryState.value;

  if (!storage) {
    return fallback;
  }

  const stored = storage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return fallback;
  }

  try {
    const parsed = sanitizeAuth(JSON.parse(stored));

    if (parsed?.expiresAt && parsed.expiresAt < Date.now()) {
      storage.removeItem(AUTH_STORAGE_KEY);
      memoryState.value = null;
      return null;
    }

    memoryState.value = parsed;
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored auth payload', error);
    storage.removeItem(AUTH_STORAGE_KEY);
    memoryState.value = null;
    return null;
  }
}

export function writeAuth(auth) {
  const storage = getStorage();
  const normalized = sanitizeAuth(auth);

  memoryState.value = normalized;

  if (!storage) {
    return;
  }

  if (!normalized) {
    storage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearAuth() {
  const storage = getStorage();
  memoryState.value = null;
  if (storage) {
    storage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getStoredUser() {
  return readAuth()?.user ?? null;
}

export function getAuthToken() {
  return null;
}
