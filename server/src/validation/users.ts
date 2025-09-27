import { Prisma } from '@prisma/client';
import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Flags = {
  hasEnderecoField: boolean;
  hasEnderecosSalvosField: boolean;
  hasMetodosPagamentoField: boolean;
};

type AddressSanitizeOptions = {
  treatNullAsEmpty: boolean;
};

const optionalTrimmedString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

const optionalEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    const lower = trimmed.toLowerCase();
    if (!z.string().email().safeParse(lower).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail inválido.' });
      return z.NEVER;
    }
    return lower;
  });

const requiredEmail = z
  .string()
  .trim()
  .min(1, { message: 'E-mail é obrigatório.' })
  .transform((value, ctx) => {
    const lower = value.toLowerCase();
    if (!z.string().email().safeParse(lower).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail inválido.' });
      return z.NEVER;
    }
    return lower;
  });

const requiredFullName = z
  .string()
  .trim()
  .min(1, { message: 'Nome completo é obrigatório.' });

const optionalPassword = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    if (trimmed.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A senha deve conter pelo menos 8 caracteres.' });
      return z.NEVER;
    }
    return trimmed;
  });

const optionalDate = z
  .union([z.string(), z.date(), z.number(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Data inválida.' });
      return z.NEVER;
    }
    return date;
  });

const optionalBoolean = z
  .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized.length === 0) {
        return undefined;
      }
      if (['true', '1', 'yes', 'y', 'sim'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n', 'nao', 'não'].includes(normalized)) {
        return false;
      }
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valor booleano inválido.' });
      return z.NEVER;
    }
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valor booleano inválido.' });
    return z.NEVER;
  });

const optionalUuidOrNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    if (!uuidRegex.test(trimmed)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Identificador inválido.' });
      return z.NEVER;
    }
    return trimmed;
  });

const sharedSchema = z
  .object({
    role: optionalTrimmedString,
    tipoUsuario: optionalTrimmedString,
    nome: optionalTrimmedString,
    sobrenome: optionalTrimmedString,
    telefone: optionalTrimmedString,
    nif: optionalTrimmedString,
    dataNascimento: optionalDate,
    fotoUrl: optionalTrimmedString,
    status: optionalTrimmedString,
    restaurantId: optionalUuidOrNull,
    consentimentoDados: optionalBoolean,
    endereco: z.unknown().optional(),
    enderecosSalvos: z.unknown().optional(),
    metodosPagamento: z.unknown().optional(),
  })
  .strict();

const userCreateSchema = sharedSchema
  .extend({
    email: requiredEmail,
    fullName: requiredFullName,
    password: optionalPassword,
  })
  .strict();

const userUpdateSchema = sharedSchema
  .extend({
    email: optionalEmail,
    fullName: optionalTrimmedString,
    password: optionalPassword,
  })
  .strict();

type SharedParsed = z.infer<typeof sharedSchema>;
type NormalizedShared = {
  role?: string;
  tipoUsuario?: string;
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  nif?: string;
  dataNascimento?: Date;
  fotoUrl?: string;
  status?: string;
  restaurantId?: string | null;
  consentimentoDados?: boolean;
  enderecosSalvos?: unknown[];
  addressesFromEndereco?: unknown[];
  metodosPagamento?: unknown[];
};

export type ParsedUserCreateInput = NormalizedShared & {
  email: string;
  fullName: string;
  password?: string;
};

export type ParsedUserUpdateInput = NormalizedShared & {
  email?: string;
  fullName?: string;
  password?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const keyAliases: Record<string, string> = {
  full_name: 'fullName',
  tipo_usuario: 'tipoUsuario',
  data_nascimento: 'dataNascimento',
  foto_url: 'fotoUrl',
  restaurant_id: 'restaurantId',
  consentimento_dados: 'consentimentoDados',
  enderecos_salvos: 'enderecosSalvos',
  metodos_pagamento: 'metodosPagamento',
};

function normalizeInputKeys(raw: unknown): unknown {
  if (!isPlainObject(raw)) {
    return raw;
  }

  const normalized: Record<string, unknown> = { ...raw };
  for (const [legacyKey, canonicalKey] of Object.entries(keyAliases)) {
    if (legacyKey in raw && !(canonicalKey in normalized)) {
      normalized[canonicalKey] = raw[legacyKey];
    }
    if (legacyKey in normalized) {
      delete normalized[legacyKey];
    }
  }

  return normalized;
}

function sanitizeAddressEntry(value: unknown): unknown | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (isPlainObject(value)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value)) {
      if (raw === null || raw === undefined) {
        continue;
      }
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) {
          continue;
        }
        cleaned[key] = trimmed;
      } else {
        cleaned[key] = raw;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  return undefined;
}

function sanitizeAddressCollection(value: unknown, options: AddressSanitizeOptions): unknown[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return options.treatNullAsEmpty ? [] : undefined;
  }

  if (Array.isArray(value)) {
    const sanitized = value
      .map((entry) => sanitizeAddressEntry(entry))
      .filter((entry): entry is unknown => entry !== undefined);
    if (sanitized.length === 0) {
      return options.treatNullAsEmpty ? [] : undefined;
    }
    return sanitized;
  }

  const single = sanitizeAddressEntry(value);
  if (single === undefined) {
    return options.treatNullAsEmpty ? [] : undefined;
  }
  return [single];
}

function normalizeSharedFields(parsed: SharedParsed, flags: Flags): NormalizedShared {
  const addressesFromEndereco = flags.hasEnderecoField
    ? sanitizeAddressCollection(parsed.endereco, { treatNullAsEmpty: false })
    : undefined;

  const enderecosSalvos = flags.hasEnderecosSalvosField
    ? sanitizeAddressCollection(parsed.enderecosSalvos, { treatNullAsEmpty: true })
    : undefined;

  let metodosPagamento: unknown[] | undefined;
  if (flags.hasMetodosPagamentoField) {
    if (Array.isArray(parsed.metodosPagamento)) {
      metodosPagamento = parsed.metodosPagamento;
    } else if (parsed.metodosPagamento === null) {
      metodosPagamento = [];
    } else {
      metodosPagamento = undefined;
    }
  }

  return {
    role: parsed.role,
    tipoUsuario: parsed.tipoUsuario,
    nome: parsed.nome,
    sobrenome: parsed.sobrenome,
    telefone: parsed.telefone,
    nif: parsed.nif,
    dataNascimento: parsed.dataNascimento,
    fotoUrl: parsed.fotoUrl,
    status: parsed.status,
    restaurantId: parsed.restaurantId,
    consentimentoDados: parsed.consentimentoDados,
    enderecosSalvos,
    addressesFromEndereco,
    metodosPagamento,
  };
}

function extractFlags(raw: unknown): Flags {
  if (!isPlainObject(raw)) {
    return {
      hasEnderecoField: false,
      hasEnderecosSalvosField: false,
      hasMetodosPagamentoField: false,
    };
  }

  return {
    hasEnderecoField: Object.prototype.hasOwnProperty.call(raw, 'endereco'),
    hasEnderecosSalvosField: Object.prototype.hasOwnProperty.call(raw, 'enderecosSalvos'),
    hasMetodosPagamentoField: Object.prototype.hasOwnProperty.call(raw, 'metodosPagamento'),
  };
}

export function parseUserCreateInput(raw: unknown): ParsedUserCreateInput {
  const normalizedInput = normalizeInputKeys(raw);
  const flags = extractFlags(normalizedInput);
  const parsed = userCreateSchema.parse(normalizedInput);
  const shared = normalizeSharedFields(parsed, flags);

  return {
    email: parsed.email,
    fullName: parsed.fullName,
    password: parsed.password ?? undefined,
    ...shared,
  };
}

export function parseUserUpdateInput(raw: unknown): ParsedUserUpdateInput {
  const normalizedInput = normalizeInputKeys(raw);
  const flags = extractFlags(normalizedInput);
  const parsed = userUpdateSchema.parse(normalizedInput);
  const shared = normalizeSharedFields(parsed, flags);

  return {
    email: parsed.email ?? undefined,
    fullName: parsed.fullName ?? undefined,
    password: parsed.password ?? undefined,
    ...shared,
  };
}

export function buildUserCreateData(
  payload: ParsedUserCreateInput,
  passwordHash?: string,
): Prisma.UserCreateInput {
  const data: Prisma.UserCreateInput = {
    email: payload.email,
    fullName: payload.fullName,
  };

  if (payload.role) data.role = payload.role;
  if (payload.tipoUsuario) data.tipoUsuario = payload.tipoUsuario;
  if (payload.nome) data.nome = payload.nome;
  if (payload.sobrenome) data.sobrenome = payload.sobrenome;
  if (payload.telefone) data.telefone = payload.telefone;
  if (payload.nif) data.nif = payload.nif;
  if (payload.dataNascimento) data.dataNascimento = payload.dataNascimento;
  if (payload.fotoUrl) data.fotoUrl = payload.fotoUrl;
  if (payload.status) data.status = payload.status;
  if (payload.consentimentoDados !== undefined) data.consentimentoDados = payload.consentimentoDados;
  if (payload.metodosPagamento !== undefined) data.metodosPagamento = payload.metodosPagamento;

  const addresses = payload.enderecosSalvos ?? payload.addressesFromEndereco;
  if (addresses !== undefined) {
    data.enderecosSalvos = addresses;
  }

  if (payload.restaurantId) {
    data.restaurant = { connect: { id: payload.restaurantId } };
  }

  if (passwordHash) {
    data.passwordHash = passwordHash;
  }

  return data;
}

export function buildUserUpdateData(
  payload: ParsedUserUpdateInput,
  passwordHash?: string,
): Prisma.UserUpdateInput {
  const data: Prisma.UserUpdateInput = {};

  if (payload.email) data.email = payload.email;
  if (payload.fullName) data.fullName = payload.fullName;
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.tipoUsuario !== undefined) data.tipoUsuario = payload.tipoUsuario;
  if (payload.nome !== undefined) data.nome = payload.nome;
  if (payload.sobrenome !== undefined) data.sobrenome = payload.sobrenome;
  if (payload.telefone !== undefined) data.telefone = payload.telefone;
  if (payload.nif !== undefined) data.nif = payload.nif;
  if (payload.dataNascimento !== undefined) data.dataNascimento = payload.dataNascimento;
  if (payload.fotoUrl !== undefined) data.fotoUrl = payload.fotoUrl;
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.consentimentoDados !== undefined) data.consentimentoDados = payload.consentimentoDados;
  if (payload.metodosPagamento !== undefined) data.metodosPagamento = payload.metodosPagamento;

  const addresses = payload.enderecosSalvos ?? payload.addressesFromEndereco;
  if (addresses !== undefined) {
    data.enderecosSalvos = addresses;
  }

  if (payload.restaurantId !== undefined) {
    data.restaurant =
      payload.restaurantId === null ? { disconnect: true } : { connect: { id: payload.restaurantId } };
  }

  if (passwordHash) {
    data.passwordHash = passwordHash;
  }

  return data;
}
