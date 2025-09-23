const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function buildHeaders(custom = {}) {
  return {
    'Content-Type': 'application/json',
    ...custom,
  };
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
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

  const options = {
    method,
    headers: buildHeaders(headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  if (method === 'GET' || method === 'HEAD') {
    delete options.body;
  }

  const response = await fetch(url, options);
  return handleResponse(response);
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
