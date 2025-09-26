import { ErrorCode } from '../../server/src/shared/error-codes.ts';
import {
  clearAuth,
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  setAuthUser,
  updateAuth,
} from './session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let refreshPromise = null;

function buildHeaders(custom = {}) {
  const token = getAuthToken();
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...custom,
  };

  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  return baseHeaders;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) {
    return { data: null };
  }

  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return { data: text };
  }
}

function buildApiError(response, data) {
  const payload = data && typeof data === 'object' ? data : null;
  const errorMessage =
    payload?.error?.message ||
    payload?.message ||
    (typeof data === 'string' ? data : null) ||
    `Request failed with status ${response.status}`;

  const error = new Error(errorMessage);
  error.status = response.status;
  error.data = data;
  error.code = payload?.error?.code ?? payload?.code;
  return error;
}

function shouldAttemptRefresh(response, data) {
  if (response.status !== 401) {
    return false;
  }

  const code = data?.error?.code ?? data?.code;
  return code === ErrorCode.INVALID_TOKEN || code === ErrorCode.UNAUTHENTICATED;
}

async function queueRefresh() {
  if (!refreshPromise) {
    refreshPromise = performRefresh()
      .catch((error) => {
        clearAuth();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function performRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token ausente. Faça login novamente.');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  });

  const { data } = await parseResponse(response);

  if (!response.ok) {
    throw buildApiError(response, data);
  }

  const token = data?.token ?? null;
  const nextRefreshToken = data?.refreshToken ?? null;
  const refreshTokenExpiresAt = data?.refreshTokenExpiresAt ?? null;
  const scopes = Array.isArray(data?.scopes) ? data.scopes : [];

  setAuthTokens({
    token,
    refreshToken: nextRefreshToken,
    tokenExpiresAt: null,
    refreshTokenExpiresAt,
    scopes,
  });

  if (data?.user) {
    setAuthUser(toSnakeCase(data.user));
  }

  return token;
}

export async function apiRequest(path, { method = 'GET', headers, body, query } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const bodyString = body !== undefined ? JSON.stringify(body) : undefined;

  const makeOptions = () => {
    const requestHeaders = buildHeaders(headers);
    const options = {
      method,
      headers: requestHeaders,
      body: bodyString,
      credentials: 'include',
    };

    if (method === 'GET' || method === 'HEAD') {
      delete options.body;
    }

    return options;
  };

  async function execute(allowRefresh) {
    const response = await fetch(url, makeOptions());
    const { data } = await parseResponse(response);

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      if (allowRefresh && shouldAttemptRefresh(response, data)) {
        try {
          await queueRefresh();
        } catch (refreshError) {
          const error = buildApiError(response, data);
          error.cause = refreshError;
          throw error;
        }
        return execute(false);
      }

      throw buildApiError(response, data);
    }

    if (data && typeof data === 'object' && data.user) {
      updateAuth({ user: toSnakeCase(data.user) });
    }

    return data;
  }

  return execute(true);
}

export function toCamelCaseKey(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformKeys(input, transformer = toCamelCaseKey) {
  if (!input || typeof input !== 'object' || input instanceof Date) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => transformKeys(item, transformer));
  }

  return Object.entries(input).reduce((acc, [key, value]) => {
    acc[transformer(key)] = transformKeys(value, transformer);
    return acc;
  }, {});
}

export function toSnakeCaseKey(key) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toSnakeCase(input) {
  return transformKeys(input, toSnakeCaseKey);
}

export function toCamelCase(input) {
  return transformKeys(input, toCamelCaseKey);
}

export function transformKeysShallow(input, transformer = toCamelCaseKey) {
  if (!input || typeof input !== 'object' || input instanceof Date || Array.isArray(input)) {
    return input;
  }

  return Object.entries(input).reduce((acc, [key, value]) => {
    acc[transformer(key)] = value;
    return acc;
  }, {});
}
