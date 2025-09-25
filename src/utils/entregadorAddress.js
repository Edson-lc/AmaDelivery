const ADDRESS_TEMPLATE = Object.freeze({
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  cep: '',
});

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createEmptyAddress() {
  return { ...ADDRESS_TEMPLATE };
}

export function normalizeAddressValue(raw) {
  if (raw === null || raw === undefined || raw === '') {
    return createEmptyAddress();
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...createEmptyAddress(), ...parsed };
      }
    } catch {
      // Ignora erros de parse e usa o texto como rua.
    }
    return { ...createEmptyAddress(), rua: raw };
  }

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...createEmptyAddress(), ...raw };
  }

  return createEmptyAddress();
}

export function prepareAddressPayload(raw) {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return raw;
  }

  const cleaned = Object.entries(raw).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    const normalized = typeof value === 'string' ? value.trim() : value;
    if (normalized === '' || normalized === null) {
      return acc;
    }

    acc[key] = normalized;
    return acc;
  }, {});

  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export function normalizeDateForInput(raw) {
  if (raw === null || raw === undefined) {
    return '';
  }

  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? '' : raw.toISOString().slice(0, 10);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return '';
    }
    if (DATE_ONLY_PATTERN.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  }

  return '';
}

export function prepareDatePayload(raw) {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw.toISOString();
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    if (DATE_ONLY_PATTERN.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  return null;
}

export function normalizeEntregadorPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  const payload = { ...data };

  if (Object.prototype.hasOwnProperty.call(payload, 'endereco')) {
    payload.endereco = prepareAddressPayload(payload.endereco);
  }

  const dateValue = Object.prototype.hasOwnProperty.call(payload, 'data_nascimento')
    ? payload.data_nascimento
    : Object.prototype.hasOwnProperty.call(payload, 'dataNascimento')
      ? payload.dataNascimento
      : undefined;

  if (dateValue !== undefined) {
    payload.data_nascimento = prepareDatePayload(dateValue);
    delete payload.dataNascimento;
  }

  return payload;
}
