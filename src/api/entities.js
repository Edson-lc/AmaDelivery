import { apiRequest, toSnakeCase, toCamelCaseKey, transformKeysShallow } from './httpClient';

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

const USER_STORAGE_KEY = 'amaeats_user';

function readStoredUser() {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to parse stored user', error);
    return null;
  }
}

function writeStoredUser(user) {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export const User = {
  async me() {
    const stored = readStoredUser();
    if (!stored?.id) {
      return null;
    }

    try {
      const data = await apiRequest(`/users/${stored.id}`);
      const user = normalizeResponse(data);
      writeStoredUser(user);
      return user;
    } catch (error) {
      console.warn('Failed to refresh stored user, falling back to local copy', error);
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
    const stored = readStoredUser();
    if (stored?.id === user.id) {
      writeStoredUser(user);
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

    if (!normalizedCreds.email || !normalizedCreds.password) {
      return null;
    }

    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: normalizedCreds,
    });
    const user = normalizeResponse(data);
    writeStoredUser(user);
    return user;
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
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignorar erros de logout
    }
    writeStoredUser(null);
    return true;
  },
};
