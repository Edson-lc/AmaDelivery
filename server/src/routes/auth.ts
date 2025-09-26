import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ErrorCode } from '../shared/error-codes';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';
import { AppError, buildErrorPayload } from '../utils/errors';
import {
  calculateRefreshTokenExpiry,
  generateRefreshTokenValue,
  getRoleScopes,
  hashToken,
  signAccessToken,
} from '../utils/auth';
import authenticate from '../middleware/authenticate';
import requireScope from '../middleware/require-scope';
import { env } from '../env';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res
        .status(400)
        .json(buildErrorPayload(ErrorCode.VALIDATION_ERROR, 'E-mail e senha são obrigatórios.'));
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json(buildErrorPayload(ErrorCode.INVALID_CREDENTIALS, 'Credenciais inválidas.'));
    }

    const isValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isValid) {
      return res.status(401).json(buildErrorPayload(ErrorCode.INVALID_CREDENTIALS, 'Credenciais inválidas.'));
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { updatedDate: now },
      }),
      prisma.refreshToken.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
          expiresAt: { lt: now },
        },
        data: { revokedAt: now },
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
        .json(buildErrorPayload(ErrorCode.USER_NOT_FOUND, 'Não foi possível carregar os dados do usuário.'));
    }

    const token = signAccessToken({ id: publicUser.id, email: publicUser.email, role: publicUser.role });
    const refreshTokenValue = generateRefreshTokenValue();
    const refreshTokenHash = hashToken(refreshTokenValue);
    const refreshTokenExpiresAt = calculateRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        userId: publicUser.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    res.json({
      token,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshToken: refreshTokenValue,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      scopes: getRoleScopes(publicUser.role),
      user: serialize(publicUser),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (typeof refreshToken === 'string' && refreshToken.trim()) {
    const hashed = hashToken(refreshToken);
    const now = new Date();
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashed, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  res.status(204).send();
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body ?? {};

    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
      return res
        .status(400)
        .json(buildErrorPayload(ErrorCode.REFRESH_TOKEN_REQUIRED, 'Refresh token é obrigatório.'));
    }

    const hashed = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: { user: { select: publicUserSelect } },
    });

    if (!stored) {
      return res.status(401).json(buildErrorPayload(ErrorCode.INVALID_REFRESH_TOKEN, 'Refresh token inválido.'));
    }

    if (stored.revokedAt) {
      return res.status(401).json(buildErrorPayload(ErrorCode.REFRESH_TOKEN_REVOKED, 'Refresh token revogado.'));
    }

    if (stored.expiresAt <= new Date()) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      return res.status(401).json(buildErrorPayload(ErrorCode.REFRESH_TOKEN_EXPIRED, 'Refresh token expirado.'));
    }

    if (!stored.user) {
      throw new AppError(401, ErrorCode.USER_NOT_FOUND, 'Usuário associado ao refresh token não encontrado.');
    }

    const newAccessToken = signAccessToken({
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    });
    const nextRefreshTokenValue = generateRefreshTokenValue();
    const nextRefreshTokenHash = hashToken(nextRefreshTokenValue);
    const nextRefreshTokenExpiresAt = calculateRefreshTokenExpiry();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: stored.user.id,
          tokenHash: nextRefreshTokenHash,
          expiresAt: nextRefreshTokenExpiresAt,
        },
      }),
    ]);

    res.json({
      token: newAccessToken,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshToken: nextRefreshTokenValue,
      refreshTokenExpiresAt: nextRefreshTokenExpiresAt.toISOString(),
      scopes: getRoleScopes(stored.user.role),
      user: serialize(stored.user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, requireScope('profile:read'), async (req, res, next) => {
  try {
    const user = res.locals.authUser;
    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

export default router;
