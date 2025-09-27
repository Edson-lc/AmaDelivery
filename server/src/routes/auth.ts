import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';
import { buildErrorPayload } from '../utils/errors';
import { signAccessToken } from '../utils/auth';
import authenticate from '../middleware/authenticate';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json(buildErrorPayload('VALIDATION_ERROR', 'E-mail e senha são obrigatórios.'));
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json(buildErrorPayload('INVALID_CREDENTIALS', 'Credenciais inválidas.'));
    }

    const isValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isValid) {
      return res.status(401).json(buildErrorPayload('INVALID_CREDENTIALS', 'Credenciais inválidas.'));
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
      return res.status(500).json(buildErrorPayload('USER_NOT_FOUND', 'Não foi possível carregar os dados do usuário.'));
    }

    const token = signAccessToken({ id: publicUser.id, email: publicUser.email, role: publicUser.role });

    res.json({
      token,
      user: serialize(publicUser),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.status(204).send();
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = res.locals.authUser;
    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

export default router;
