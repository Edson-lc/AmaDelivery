const AUTH_STORAGE_KEY = 'amaeats_auth_v2';
const LEGACY_KEYS = ['amaeats_auth_v1'];

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeAuthPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      token: null,
      refreshToken: null,
      user: null,
      scopes: [],
      tokenExpiresAt: null,
      refreshTokenExpiresAt: null,
    };
  }

  const token = typeof raw.token === 'string' ? raw.token : typeof raw.accessToken === 'string' ? raw.accessToken : null;
  const refreshToken = typeof raw.refreshToken === 'string' ? raw.refreshToken : null;
  const scopes = Array.isArray(raw.scopes)
    ? Array.from(new Set(raw.scopes.filter((scope) => typeof scope === 'string')))
    : [];
  const tokenExpiresAt = typeof raw.tokenExpiresAt === 'string' ? raw.tokenExpiresAt : null;
  const refreshTokenExpiresAt = typeof raw.refreshTokenExpiresAt === 'string' ? raw.refreshTokenExpiresAt : null;

  return {
    token,
    refreshToken,
    user: raw.user ?? null,
    scopes,
    tokenExpiresAt,
    refreshTokenExpiresAt,
  };
}

function persist(auth) {
  if (!isBrowser()) return;
  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  const normalized = normalizeAuthPayload(auth);
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
}

function tryParseStoredValue(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse stored auth payload', error);
    return null;
  }
}

export function readAuth() {
  if (!isBrowser()) return null;

  const keys = [AUTH_STORAGE_KEY, ...LEGACY_KEYS];
  for (const key of keys) {
    const stored = window.localStorage.getItem(key);
    if (!stored) continue;

    const parsed = tryParseStoredValue(stored);
    if (!parsed) {
      window.localStorage.removeItem(key);
      continue;
    }

    const normalized = normalizeAuthPayload(parsed);
    if (key !== AUTH_STORAGE_KEY) {
      persist(normalized);
      window.localStorage.removeItem(key);
    }
    return normalized;
  }

  return null;
}

export function writeAuth(auth) {
  persist(auth);
}

export function updateAuth(partial) {
  const current = readAuth() ?? normalizeAuthPayload(null);
  const next = { ...current };

  if (partial && typeof partial === 'object') {
    Object.entries(partial).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      if (key === 'scopes' && Array.isArray(value)) {
        next.scopes = Array.from(new Set(value.filter((scope) => typeof scope === 'string')));
        return;
      }
      next[key] = value;
    });
  }

  persist(next);
  return next;
}

export function clearAuth() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

export function getStoredUser() {
  return readAuth()?.user ?? null;
}

export function getAuthToken() {
  return readAuth()?.token ?? null;
}

export function getRefreshToken() {
  return readAuth()?.refreshToken ?? null;
}

export function getAuthScopes() {
  return readAuth()?.scopes ?? [];
}

export function setAuthTokens({ token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt, scopes }) {
  return updateAuth({ token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt, scopes });
}

export function setAuthUser(user) {
  return updateAuth({ user });
}
