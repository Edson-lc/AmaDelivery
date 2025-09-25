import { Router } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseDateInput(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const isoCandidate = DATE_ONLY_REGEX.test(trimmed) ? `${trimmed}T00:00:00.000Z` : trimmed;
    const parsed = new Date(isoCandidate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function normalizeEntregadorData(body: unknown): Record<string, any> {
  const record: Record<string, any> = body && typeof body === 'object' ? { ...(body as Record<string, unknown>) } : {};

  const rawDate = record['dataNascimento'] ?? record['data_nascimento'];

  if ('data_nascimento' in record) {
    delete record['data_nascimento'];
  }

  if (rawDate !== undefined) {
    record['dataNascimento'] = parseDateInput(rawDate);
  }

  return record;
}

// Strongly-typed helpers and normalizers
function toStringOrUndefined(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
}

function toBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).trim().toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  return undefined;
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function prepareEndereco(raw: unknown): Prisma.InputJsonValue | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (Array.isArray(raw)) return raw as unknown as Prisma.InputJsonValue;
  if (typeof raw === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v === null || v === undefined) continue;
      if (typeof v === 'string') {
        const t = v.trim();
        if (!t) continue;
        cleaned[k] = t;
      } else {
        cleaned[k] = v;
      }
    }
    return Object.keys(cleaned).length > 0 ? (cleaned as Prisma.InputJsonValue) : undefined;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t ? (t as unknown as Prisma.InputJsonValue) : undefined;
  }
  return undefined;
}

function normalizeCreateInput(body: unknown): Prisma.EntregadorCreateInput {
  const r = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  const email = toStringOrUndefined(r.email);
  const nomeCompleto = toStringOrUndefined(r.nomeCompleto ?? (r as any).nome_completo);
  const telefone = toStringOrUndefined(r.telefone);
  if (!email || !nomeCompleto || !telefone) {
    throw Object.assign(new Error('email, nomeCompleto e telefone são obrigatórios.'), { status: 400 });
  }

  const userId = toStringOrUndefined(r.userId ?? (r as any).user_id);
  const dataNascimento = parseDateInput(r.dataNascimento ?? (r as any).data_nascimento) ?? undefined;
  const endereco = prepareEndereco(r.endereco);

  const input: Prisma.EntregadorCreateInput = {
    email,
    nomeCompleto,
    telefone,
    endereco,
    nif: toStringOrUndefined(r.nif),
    dataNascimento,
    fotoUrl: toStringOrUndefined(r.fotoUrl ?? (r as any).foto_url),
    status: toStringOrUndefined(r.status),
    aprovado: toBooleanOrUndefined(r.aprovado),
    veiculoTipo: toStringOrUndefined(r.veiculoTipo ?? (r as any).veiculo_tipo),
    veiculoPlaca: toStringOrUndefined(r.veiculoPlaca ?? (r as any).veiculo_placa),
    disponivel: toBooleanOrUndefined(r.disponivel),
    avaliacao: toNumberOrUndefined(r.avaliacao),
    totalEntregas: toNumberOrUndefined(r.totalEntregas),
    latitude: toNumberOrUndefined(r.latitude),
    longitude: toNumberOrUndefined(r.longitude),
    iban: toStringOrUndefined(r.iban),
    nomeBanco: toStringOrUndefined(r.nomeBanco ?? (r as any).nome_banco),
    ultimoLogin: parseDateInput(r.ultimoLogin ?? (r as any).ultimo_login) ?? undefined,
    ...(userId ? { user: { connect: { id: userId } } } : {}),
  };

  return input;
}

function normalizeUpdateInput(body: unknown): Prisma.EntregadorUpdateInput {
  const r = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  const userId = toStringOrUndefined(r.userId ?? (r as any).user_id);
  const dataNascimento = parseDateInput(r.dataNascimento ?? (r as any).data_nascimento) ?? undefined;
  const endereco = prepareEndereco(r.endereco);

  const input: Prisma.EntregadorUpdateInput = {
    email: toStringOrUndefined(r.email),
    nomeCompleto: toStringOrUndefined(r.nomeCompleto ?? (r as any).nome_completo),
    telefone: toStringOrUndefined(r.telefone),
    endereco: endereco as any,
    nif: toStringOrUndefined(r.nif),
    dataNascimento: dataNascimento as any,
    fotoUrl: toStringOrUndefined(r.fotoUrl ?? (r as any).foto_url),
    status: toStringOrUndefined(r.status),
    aprovado: toBooleanOrUndefined(r.aprovado),
    veiculoTipo: toStringOrUndefined(r.veiculoTipo ?? (r as any).veiculo_tipo),
    veiculoPlaca: toStringOrUndefined(r.veiculoPlaca ?? (r as any).veiculo_placa),
    disponivel: toBooleanOrUndefined(r.disponivel),
    avaliacao: toNumberOrUndefined(r.avaliacao) as any,
    totalEntregas: toNumberOrUndefined(r.totalEntregas) as any,
    latitude: toNumberOrUndefined(r.latitude) as any,
    longitude: toNumberOrUndefined(r.longitude) as any,
    iban: toStringOrUndefined(r.iban),
    nomeBanco: toStringOrUndefined(r.nomeBanco ?? (r as any).nome_banco),
    ultimoLogin: (parseDateInput(r.ultimoLogin ?? (r as any).ultimo_login) ?? undefined) as any,
    ...(userId ? { user: { connect: { id: userId } } } : {}),
  };

  Object.keys(input).forEach((k) => {
    if ((input as any)[k] === undefined) {
      delete (input as any)[k];
    }
  });

  return input;
}

router.get('/', async (req, res, next) => {
  try {
    const { userId, email, aprovado, disponivel, status, id } = req.query;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = String(userId);
    }

    if (email) {
      where.email = String(email);
    }

    if (status) {
      where.status = String(status);
    }

    if (id) {
      where.id = String(id);
    }

    if (aprovado !== undefined) {
      where.aprovado = String(aprovado) === 'true';
    }

    if (disponivel !== undefined) {
      where.disponivel = String(disponivel) === 'true';
    }

    const entregadores = await prisma.entregador.findMany({
      where,
      orderBy: { createdDate: 'desc' },
    });

    res.json(serialize(entregadores));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const entregador = await prisma.entregador.findUnique({ where: { id } });

    if (!entregador) {
      return res.status(404).json({ message: 'Entregador not found' });
    }

    res.json(serialize(entregador));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = normalizeCreateInput(req.body ?? {});

    if (!data.email || !data.nomeCompleto || !data.telefone) {
      return res.status(400).json({ message: 'email, nomeCompleto e telefone são obrigatórios.' });
    }

    const entregador = await prisma.entregador.create({ data });
    res.status(201).json(serialize(entregador));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = normalizeUpdateInput(req.body ?? {});

    const entregador = await prisma.entregador.update({
      where: { id },
      data,
    });

    res.json(serialize(entregador));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.entregador.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;





