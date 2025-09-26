import jwt from 'jsonwebtoken';
import { env } from '../env';
import { AppError } from './errors';

type JwtPayload = {
  sub: string;
  email: string;
  role?: string | null;
};

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

  return token;
}
