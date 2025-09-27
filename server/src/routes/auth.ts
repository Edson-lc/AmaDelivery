import { Router, type CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';
import { buildErrorPayload } from '../utils/errors';
import { signAccessToken } from '../utils/auth';
import authenticate from '../middleware/authenticate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { env } from '../env';

const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .trim()
    .min(1, { message: 'E-mail é obrigatório.' })
    .transform((value, ctx) => {
      const lower = value.toLowerCase();
      if (!z.string().email().safeParse(lower).success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail inválido.' });
        return z.NEVER;
      }
      return lower;
    }),
  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(8, { message: 'A senha deve conter pelo menos 8 caracteres.' })
    .trim(),
});

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.ACCESS_TOKEN_COOKIE_SECURE,
  sameSite: env.ACCESS_TOKEN_COOKIE_SAME_SITE,
  maxAge: env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
  path: env.ACCESS_TOKEN_COOKIE_PATH,
  ...(env.ACCESS_TOKEN_COOKIE_DOMAIN ? { domain: env.ACCESS_TOKEN_COOKIE_DOMAIN } : {}),
};

const router = Router();

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body ?? {});

    if (!result.success) {
      return res
        .status(400)
        .json(
          buildErrorPayload(
            'VALIDATION_ERROR',
            'E-mail e senha são obrigatórios.',
            result.error.flatten(),
            res.locals.requestId,
          ),
        );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res
        .status(401)
        .json(buildErrorPayload('INVALID_CREDENTIALS', 'Credenciais inválidas.', undefined, res.locals.requestId));
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res
        .status(401)
        .json(buildErrorPayload('INVALID_CREDENTIALS', 'Credenciais inválidas.', undefined, res.locals.requestId));
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { updatedDate: now },
      }),
      ...(user.tipoUsuario === 'entregador'
        ? [
            prisma.entregador.updateMany({
              where: { userId: user.id },
              data: { ultimoLogin: now },
            }),
          ]
        : []),
    ]);

    const publicUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: publicUserSelect,
    });

    if (!publicUser) {
      return res
        .status(500)
        .json(
          buildErrorPayload(
            'USER_NOT_FOUND',
            'Não foi possível carregar os dados do usuário.',
            undefined,
            res.locals.requestId,
          ),
        );
    }

    const token = signAccessToken({ id: publicUser.id, email: publicUser.email, role: publicUser.role });
    const expiresAt = Date.now() + env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS;

    res
      .cookie(env.ACCESS_TOKEN_COOKIE_NAME, token, cookieOptions)
      .json({
        token,
        user: serialize(publicUser),
        expiresAt,
      });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(env.ACCESS_TOKEN_COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.status(204).send();
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = res.locals.authUser;
    const payload = res.locals.tokenPayload as { exp?: number } | undefined;
    const expiresAt = payload?.exp ? payload.exp * 1000 : undefined;
    res.json({ ...serialize(user), ...(expiresAt ? { expiresAt } : {}) });
  } catch (error) {
    next(error);
  }
});

export default router;
