import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import { env } from '../env';
import { AppError } from './errors';

type JwtPayload = {
  sub: string;
  email: string;
  role?: string | null;
  exp?: number;
  iat?: number;
};

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
  signedCookies?: Record<string, string | undefined>;
};

function sanitizeToken(token: unknown): string {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new AppError(401, 'INVALID_TOKEN', 'Token inválido ou expirado.');
  }

  return token.trim();
}

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((acc, chunk) => {
    const [rawKey, ...rawValue] = chunk.split('=');
    if (!rawKey) {
      return acc;
    }

    const key = rawKey.trim();
    if (!key) {
      return acc;
    }

    const value = rawValue.join('=').trim();
    if (!value) {
      return acc;
    }

    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function signAccessToken(user: { id: string; email: string; role?: string | null }) {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role ?? undefined,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded) {
      throw new AppError(401, 'INVALID_TOKEN', 'Token inválido.');
    }
    return decoded as JwtPayload;
  } catch (error) {
    throw new AppError(401, 'INVALID_TOKEN', 'Token inválido ou expirado.');
  }
}

export function extractTokenFromHeader(header?: string | null) {
  if (!header) {
    throw new AppError(401, 'MISSING_TOKEN', 'Cabeçalho Authorization ausente.');
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new AppError(401, 'INVALID_AUTH_HEADER', 'Formato do cabeçalho Authorization inválido.');
  }

  return sanitizeToken(token);
}

export function extractAccessToken(req: Request): string {
  try {
    return extractTokenFromHeader(req.headers.authorization);
  } catch (error) {
    if (error instanceof AppError && error.code !== 'MISSING_TOKEN') {
      throw error;
    }
  }

  const requestWithCookies = req as RequestWithCookies;
  const cookieToken =
    requestWithCookies.cookies?.[env.ACCESS_TOKEN_COOKIE_NAME] ??
    requestWithCookies.signedCookies?.[env.ACCESS_TOKEN_COOKIE_NAME];

  if (cookieToken) {
    return sanitizeToken(cookieToken);
  }

  const parsedCookies = parseCookieHeader(req.headers.cookie as string | undefined);
  const tokenFromHeader = parsedCookies[env.ACCESS_TOKEN_COOKIE_NAME];

  if (tokenFromHeader) {
    return sanitizeToken(tokenFromHeader);
  }

  throw new AppError(401, 'MISSING_TOKEN', 'Token de acesso não informado.');
}

export type { JwtPayload };
