import { Prisma } from '@prisma/client';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as (Prisma.UserCreateInput & { password?: string }) | Record<string, unknown>;

    const email = String((body as any).email ?? '').trim().toLowerCase();
    const fullName = String((body as any).fullName ?? (body as any).full_name ?? '').trim();
    const password = (body as any).password as string | undefined;

    if (!email || !fullName) {
      return res.status(400).json({ message: 'E-mail e nome completo são obrigatórios.' });
    }

    let passwordHash: string | undefined;
    if (typeof password === 'string' && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Build create data by whitelisting known fields only
    const enderecoRaw = (body as any).endereco as unknown;

    const normalizeEndereco = (val: unknown): unknown => {
      if (val === null || val === undefined) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'object') {
        const obj = val as Record<string, unknown>;
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v === null || v === undefined) continue;
          if (typeof v === 'string') {
            const t = v.trim();
            if (!t) continue;
            cleaned[k] = t;
          } else {
            cleaned[k] = v;
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
      if (typeof val === 'string') {
        const t = val.trim();
        return t || undefined;
      }
      return undefined;
    };

    const enderecoPrepared = normalizeEndereco(enderecoRaw);

    const createData: Prisma.UserCreateInput = {
      email,
      fullName,
      // Optional fields
      role: (body as any).role ?? undefined,
      tipoUsuario: (body as any).tipoUsuario ?? undefined,
      nome: (body as any).nome ?? undefined,
      sobrenome: (body as any).sobrenome ?? undefined,
      telefone: (body as any).telefone ?? undefined,
      nif: (body as any).nif ?? undefined,
      dataNascimento: (body as any).dataNascimento ? new Date(String((body as any).dataNascimento)) : undefined,
      fotoUrl: (body as any).fotoUrl ?? undefined,
      status: (body as any).status ?? undefined,
      restaurant: (body as any).restaurantId
        ? { connect: { id: String((body as any).restaurantId) } }
        : undefined,
      passwordHash,
      consentimentoDados: (body as any).consentimentoDados ?? undefined,
      enderecosSalvos: (body as any).enderecosSalvos ?? (enderecoPrepared !== undefined ? [enderecoPrepared] : undefined),
      metodosPagamento: (body as any).metodosPagamento ?? undefined,
    } as Prisma.UserCreateInput;

    const created = await prisma.user.create({ data: createData });

    const user = await prisma.user.findUnique({
      where: { id: created.id },
      select: publicUserSelect,
    });

    return res.status(201).json(serialize(user));
  } catch (error: any) {
    // Handle unique email constraint
    if (error?.code === 'P2002') {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { email, role, tipoUsuario, id } = req.query;

    const where: Prisma.UserWhereInput = {};

    if (email) {
      where.email = { contains: String(email), mode: Prisma.QueryMode.insensitive };
    }

    if (role) {
      where.role = String(role);
    }

    if (tipoUsuario) {
      where.tipoUsuario = String(tipoUsuario);
    }

    if (id) {
      where.id = String(id);
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdDate: 'desc' },
      select: publicUserSelect,
    });

    res.json(serialize(users));
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = (req.body ?? {}) as (Prisma.UserUpdateInput & { password?: string; endereco?: unknown }) | Record<string, unknown>;
    const updateData: Prisma.UserUpdateInput = { ...body } as Prisma.UserUpdateInput;

    let nextPasswordHash: string | undefined;
    if (typeof body.password === 'string' && body.password.trim().length > 0) {
      nextPasswordHash = await bcrypt.hash(body.password, 10);
    }

    delete (updateData as Record<string, unknown>).password;

    if (nextPasswordHash) {
      (updateData as Prisma.UserUpdateInput).passwordHash = nextPasswordHash;
    } else {
      delete (updateData as Record<string, unknown>).passwordHash;
    }

    // Normalizar data de nascimento se vier como string
    if ((body as any).dataNascimento) {
      (updateData as any).dataNascimento = new Date(String((body as any).dataNascimento));
    }

    // Mapear endereco string -> enderecosSalvos JSON
    if (Object.prototype.hasOwnProperty.call(body, 'endereco')) {
      const raw = (body as any).endereco as unknown;
      let prepared: unknown;
      if (raw === null || raw === undefined) {
        prepared = undefined;
      } else if (Array.isArray(raw)) {
        prepared = raw;
      } else if (typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v === null || v === undefined) continue;
          if (typeof v === 'string') {
            const t = v.trim();
            if (!t) continue;
            cleaned[k] = t;
          } else {
            cleaned[k] = v;
          }
        }
        prepared = Object.keys(cleaned).length > 0 ? cleaned : undefined;
      } else if (typeof raw === 'string') {
        const t = raw.trim();
        prepared = t || undefined;
      }

      if (prepared !== undefined) {
        (updateData as any).enderecosSalvos = [prepared];
      }
    }

    // Garantir que campo não-modelo não é enviado
    delete (updateData as Record<string, unknown>).endereco;

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

export default router;

