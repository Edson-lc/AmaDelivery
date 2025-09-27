import { Prisma } from '@prisma/client';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';
import { buildErrorPayload } from '../utils/errors';
import { parsePagination, applyPaginationHeaders } from '../utils/pagination';
import { requireRole, requireSelfOrRole } from '../middleware/authorize';
import {
  buildUserCreateData,
  buildUserUpdateData,
  parseUserCreateInput,
  parseUserUpdateInput,
} from '../validation/users';

const ADMIN_ROLES = ['admin', 'gestor', 'manager', 'super_admin'];

const router = Router();

router.post('/', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const payload = parseUserCreateInput(req.body);
    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : undefined;
    const data = buildUserCreateData(payload, passwordHash);

    const created = await prisma.user.create({ data });
    const user = await prisma.user.findUnique({ where: { id: created.id }, select: publicUserSelect });

    if (!user) {
      return res
        .status(500)
        .json(
          buildErrorPayload(
            'USER_NOT_FOUND',
            'Não foi possível carregar os dados do usuário recém-criado.',
            undefined,
            res.locals.requestId,
          ),
        );
    }

    return res.status(201).json(serialize(user));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(
          buildErrorPayload(
            'VALIDATION_ERROR',
            'Dados inválidos. Verifique as informações enviadas.',
            error.flatten(),
            res.locals.requestId,
          ),
        );
    }

    if ((error as { code?: string })?.code === 'P2002') {
      return res
        .status(409)
        .json(
          buildErrorPayload('EMAIL_ALREADY_REGISTERED', 'E-mail já cadastrado.', undefined, res.locals.requestId),
        );
    }

    return next(error);
  }
});

router.get('/', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const ensureString = (value: unknown): string | undefined => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      }
      if (Array.isArray(value) && value.length > 0) {
        return ensureString(value[0]);
      }
      return undefined;
    };

    const email = ensureString(req.query.email);
    const role = ensureString(req.query.role);
    const tipoUsuario = ensureString(req.query.tipoUsuario ?? req.query.tipo_usuario);
    const id = ensureString(req.query.id);

    const pagination = parsePagination(req.query as Record<string, unknown>);

    const where: Prisma.UserWhereInput = {};

    if (email) {
      where.email = { contains: email, mode: Prisma.QueryMode.insensitive };
    }

    if (role) {
      where.role = role;
    }

    if (tipoUsuario) {
      where.tipoUsuario = tipoUsuario;
    }

    if (id) {
      where.id = id;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdDate: 'desc' },
        select: publicUserSelect,
        ...(pagination.limit !== undefined ? { take: pagination.limit } : {}),
        ...(pagination.skip !== undefined ? { skip: pagination.skip } : {}),
      }),
    ]);

    applyPaginationHeaders(res, pagination, total);

    res.json(serialize(users));
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    if (!res.locals.authUser) {
      return res
        .status(401)
        .json(buildErrorPayload('UNAUTHENTICATED', 'Sessão expirada ou inválida.', undefined, res.locals.requestId));
    }

    res.json(serialize(res.locals.authUser));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireSelfOrRole('id', ...ADMIN_ROLES), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      return res
        .status(404)
        .json(buildErrorPayload('USER_NOT_FOUND', 'Usuário não encontrado.', undefined, res.locals.requestId));
    }

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireSelfOrRole('id', ...ADMIN_ROLES), async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = parseUserUpdateInput(req.body);
    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : undefined;
    const data = buildUserUpdateData(payload, passwordHash);

    await prisma.user.update({
      where: { id },
      data,
    });

    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      return res
        .status(404)
        .json(buildErrorPayload('USER_NOT_FOUND', 'Usuário não encontrado.', undefined, res.locals.requestId));
    }

    res.json(serialize(user));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(
          buildErrorPayload(
            'VALIDATION_ERROR',
            'Dados inválidos. Verifique as informações enviadas.',
            error.flatten(),
            res.locals.requestId,
          ),
        );
    }

    if ((error as { code?: string })?.code === 'P2002') {
      return res
        .status(409)
        .json(
          buildErrorPayload('EMAIL_ALREADY_REGISTERED', 'E-mail já cadastrado.', undefined, res.locals.requestId),
        );
    }

    next(error);
  }
});

export default router;
