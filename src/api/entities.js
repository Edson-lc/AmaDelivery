import { apiRequest, toSnakeCase, toCamelCaseKey, transformKeysShallow } from './httpClient';
import {
  readAuth,
  clearAuth,
  getStoredUser,
  setAuthTokens,
  setAuthUser,
  getRefreshToken,
} from './session';

function normalizeResponse(data) {
  return toSnakeCase(data);
}

function buildQuery(filter = {}, options = {}) {
  const query = {};

  if (filter && typeof filter === 'object') {
    Object.entries(filter).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      query[toCamelCaseKey(key)] = value;
    });
  }

  const { limit, skip, sort, search } = options;
  if (limit !== undefined) query.limit = limit;
  if (skip !== undefined) query.skip = skip;
  if (sort !== undefined) query.sort = sort;
  if (search !== undefined) query.search = search;

  return query;
}

function mapBody(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }
  return transformKeysShallow(payload, toCamelCaseKey);
}

function createEntityClient(resource) {
  return {
    async list(sort, limit, skip) {
      const query = buildQuery({}, { sort, limit, skip });
      const data = await apiRequest(`/${resource}`, { query });
      return normalizeResponse(data);
    },
    async filter(filter = {}, sort, limit, skip) {
      const query = buildQuery(filter, { sort, limit, skip });
      const data = await apiRequest(`/${resource}`, { query });
      return normalizeResponse(data);
    },
    async get(id) {
      const data = await apiRequest(`/${resource}/${id}`);
      return normalizeResponse(data);
    },
    async create(payload) {
      const body = mapBody(payload);
      const data = await apiRequest(`/${resource}`, {
        method: 'POST',
        body,
      });
      return normalizeResponse(data);
    },
    async update(id, payload) {
      const body = mapBody(payload);
      const data = await apiRequest(`/${resource}/${id}`, {
        method: 'PUT',
        body,
      });
      return normalizeResponse(data);
    },
    async delete(id) {
      await apiRequest(`/${resource}/${id}`, { method: 'DELETE' });
      return true;
    },
  };
}

export const Restaurant = {
  ...createEntityClient('restaurants'),
  async filter(filter = {}, sort, limit, skip) {
    const query = buildQuery(filter, { sort, limit, skip });
    const data = await apiRequest('/restaurants', {
      query,
    });
    return normalizeResponse(data);
  },
};

export const MenuItem = createEntityClient('menu-items');
export const Order = createEntityClient('orders');
export const Cart = createEntityClient('carts');
export const Customer = createEntityClient('customers');
export const Entregador = createEntityClient('entregadores');
export const Delivery = createEntityClient('deliveries');
export const AlteracaoPerfil = createEntityClient('alteracoes-perfil');

export const User = {
  async me() {
    const currentAuth = readAuth();
    if (!currentAuth?.token) {
      return null;
    }
    try {
      const data = await apiRequest('/auth/me');
      const user = normalizeResponse(data);
      setAuthUser(user);
      return user;
    } catch (error) {
      if (error?.status === 401) {
        clearAuth();
        return null;
      }
      const stored = getStoredUser();
      if (stored) {
        console.warn('Failed to refresh stored user, falling back to local copy', error);
      }
      return stored;
    }
  },
  async list(sort, limit, skip) {
    const data = await apiRequest('/users', { query: buildQuery({}, { sort, limit, skip }) });
    return normalizeResponse(data);
  },
  async create(payload) {
    const body = mapBody(payload);
    const data = await apiRequest('/users', {
      method: 'POST',
      body,
    });
    return normalizeResponse(data);
  },
  async update(id, payload) {
    const body = mapBody(payload);
    const data = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body,
    });
    const user = normalizeResponse(data);
    const auth = readAuth();
    if (auth?.user?.id === user.id) {
      setAuthUser(user);
    }
    return user;
  },
  async updateMyUserData(payload) {
    const user = await User.me();
    if (!user) {
      throw new Error('No authenticated user');
    }
    return User.update(user.id, payload);
  },
  async login(credentials) {
    const creds = credentials;

    if (!creds) {
      if (typeof window !== 'undefined') {
        const current = window.location.pathname + window.location.search + window.location.hash;
        const q = `?redirect=${encodeURIComponent(current)}`;
        window.location.href = `/Login${q}`;
        return null;
      }
      throw new Error('Credenciais ausentes. Utilize a página /Login.');
    }

    const normalizedCreds = {
      email: String(creds.email ?? '').trim().toLowerCase(),
      password: String(creds.password ?? ''),
    };

    if (!normalizedCreds.email) {
      throw new Error('Informe um e-mail válido.');
    }

    if (!normalizedCreds.password) {
      throw new Error('Informe a sua senha.');
    }

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: normalizedCreds,
      });
      const normalized = normalizeResponse(data);
      const userPayload = normalized?.user ?? normalized?.data?.user;
      const user = userPayload ? normalizeResponse(userPayload) : null;
      const token = normalized?.token ?? data?.token;
      const refreshToken =
        normalized?.refresh_token ?? normalized?.data?.refresh_token ?? data?.refreshToken ?? null;
      const refreshTokenExpiresAt =
        normalized?.refresh_token_expires_at ?? normalized?.data?.refresh_token_expires_at ?? data?.refreshTokenExpiresAt ?? null;
      const scopes = Array.isArray(normalized?.scopes)
        ? normalized.scopes
        : Array.isArray(data?.scopes)
        ? data.scopes
        : [];
      if (!user || !token || !refreshToken) {
        throw new Error('Resposta de autenticação incompleta.');
      }
      setAuthTokens({
        token,
        refreshToken,
        tokenExpiresAt: null,
        refreshTokenExpiresAt,
        scopes,
      });
      setAuthUser(user);
      return user;
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        throw new Error('Credenciais inválidas. Verifique o e-mail e a senha informados.');
      }
      if (error?.status === 400) {
        throw new Error(error?.message || 'E-mail e senha são obrigatórios.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Não foi possível autenticar. Tente novamente mais tarde.');
    }
  },
  async loginWithRedirect(redirectUrl) {
    if (typeof window !== 'undefined') {
      const q = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
      window.location.href = `/Login${q}`;
      return null;
    }
    throw new Error('loginWithRedirect requer ambiente de navegador.');
  },
  async logout() {
    try {
      const refreshToken = getRefreshToken();
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: refreshToken ? { refreshToken } : undefined,
      });
    } catch (error) {
      // Ignorar erros de logout
    }
    clearAuth();
    return true;
  },
};
