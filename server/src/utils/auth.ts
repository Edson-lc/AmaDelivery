import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ErrorCode } from '../shared/error-codes';
import { env } from '../env';
import { AppError } from './errors';

export type JwtPayload = {
  sub: string;
  email: string;
  role?: string | null;
  scopes: string[];
};

const ROLE_SCOPES: Record<string, string[]> = {
  admin: ['*'],
  user: [
    'auth:refresh',
    'profile:read',
    'profile:write',
    'restaurants:read',
    'restaurants:write',
    'menu-items:read',
    'menu-items:write',
    'orders:read',
    'orders:write',
    'carts:read',
    'carts:write',
    'customers:read',
    'customers:write',
    'deliveries:read',
    'deliveries:write',
    'alteracoes-perfil:read',
    'alteracoes-perfil:write',
  ],
};

export function getRoleScopes(role?: string | null): string[] {
  const normalized = (role ?? 'user').toLowerCase();
  const scopes = ROLE_SCOPES[normalized] ?? ROLE_SCOPES.user ?? [];
  return [...new Set(scopes)];
}

export function signAccessToken(user: { id: string; email: string; role?: string | null }) {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role ?? undefined,
    scopes: getRoleScopes(user.role),
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function tryVerifyWithSecret(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string' || !decoded) {
    throw new AppError(401, ErrorCode.INVALID_TOKEN, 'Token inválido.');
  }

  const payload = decoded as JwtPayload;
  if (!Array.isArray(payload.scopes) || payload.scopes.length === 0) {
    payload.scopes = getRoleScopes(payload.role);
  }

  return payload;
}

export function verifyAccessToken(token: string): JwtPayload {
  const secrets = [env.JWT_SECRET, ...env.JWT_SECRET_FALLBACKS];

  for (let index = 0; index < secrets.length; index += 1) {
    const secret = secrets[index];
    try {
      return tryVerifyWithSecret(token, secret);
    } catch (error) {
      const isLastSecret = index === secrets.length - 1;

      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, ErrorCode.INVALID_TOKEN, 'Token expirado.');
      }

      if (!isLastSecret && error instanceof jwt.JsonWebTokenError) {
        const message = (error.message ?? '').toLowerCase();
        if (message.includes('signature')) {
          continue;
        }
      }

      throw new AppError(401, ErrorCode.INVALID_TOKEN, 'Token inválido ou expirado.');
    }
  }

  throw new AppError(401, ErrorCode.INVALID_TOKEN, 'Token inválido ou expirado.');
}

export function extractTokenFromHeader(header?: string | null) {
  if (!header) {
    throw new AppError(401, ErrorCode.MISSING_TOKEN, 'Cabeçalho Authorization ausente.');
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new AppError(401, ErrorCode.INVALID_AUTH_HEADER, 'Formato do cabeçalho Authorization inválido.');
  }

  return token;
}

export function generateRefreshTokenValue() {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function calculateRefreshTokenExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
  return expiresAt;
}
