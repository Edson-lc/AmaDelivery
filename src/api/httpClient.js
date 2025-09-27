const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const DEFAULT_TIMEOUT = 15_000;

export class ApiError extends Error {
  constructor(message, { status, data, url, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.url = url;
    if (cause) {
      this.cause = cause;
    }
  }
}

function buildHeaders(custom = {}) {
  const baseHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...custom,
  };

  return baseHeaders;
}

async function parseResponseBody(response, requestUrl) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const text = await response.text();

  if (!text) {
    return null;
  }

  if (!isJson) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ApiError('Não foi possível interpretar a resposta do servidor.', {
      status: response.status,
      data: text,
      url: requestUrl,
      cause: error,
    });
  }
}

export async function apiRequest(path, { method = 'GET', headers, body, query, timeout = DEFAULT_TIMEOUT, signal } = {}) {
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
    credentials: 'include',
    signal: undefined,
  };

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const shouldSerializeBody = body !== undefined && !isFormData && method !== 'GET' && method !== 'HEAD';

  if (shouldSerializeBody) {
    options.body = JSON.stringify(body);
  } else if (isFormData) {
    options.body = body;
    delete options.headers['Content-Type'];
  }

  if (method === 'GET' || method === 'HEAD') {
    delete options.body;
  }

  const controller = new AbortController();
  let timeoutId;

  if (typeof timeout === 'number' && timeout > 0) {
    timeoutId = setTimeout(() => {
      controller.abort(new DOMException('Tempo limite da requisição excedido.', 'AbortError'));
    }, timeout);
  }

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
    }
  }

  options.signal = controller.signal;

  try {
    const response = await fetch(url, options);
    const data = await parseResponseBody(response, url.toString());

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, { status: response.status, data, url: url.toString() });
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      throw new ApiError('A requisição foi cancelada ou expirou.', {
        status: 408,
        data: null,
        url: url.toString(),
        cause: error,
      });
    }

    throw new ApiError(error?.message || 'Erro ao realizar a requisição.', {
      status: error?.status ?? 500,
      data: error?.data,
      url: url.toString(),
      cause: error,
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
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
