import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { extractAccessToken, verifyAccessToken } from '../utils/auth';
import { AppError, buildErrorPayload } from '../utils/errors';
import { publicUserSelect } from '../utils/user';

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: {
      id: string;
      email: string;
      role?: string | null;
    };
  }
}

export default async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractAccessToken(req);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError(401, 'USER_NOT_FOUND', 'Usuário associado ao token não encontrado.');
    }

    req.authUser = { id: user.id, email: user.email, role: user.role };
    res.locals.authUser = user;
    res.locals.tokenPayload = payload;

    next();
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError(401, 'INVALID_TOKEN', 'Token inválido ou expirado.');
    res
      .status(appError.status)
      .json(buildErrorPayload(appError.code, appError.message, undefined, res.locals.requestId));
  }
}
