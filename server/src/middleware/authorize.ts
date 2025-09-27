import type { NextFunction, Request, Response } from 'express';
import { buildErrorPayload } from '../utils/errors';

function normalizeRoles(roles: string[]): string[] {
  return roles.map((role) => role.trim().toLowerCase()).filter(Boolean);
}

function hasRequiredRole(currentRole: string | null | undefined, allowedRoles: string[]): boolean {
  if (!currentRole) {
    return false;
  }

  const normalizedCurrent = currentRole.trim().toLowerCase();
  return allowedRoles.includes(normalizedCurrent);
}

export function requireRole(...allowed: string[]) {
  const allowedRoles = normalizeRoles(allowed.length > 0 ? allowed : ['admin']);

  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.authUser ?? req.authUser;

    if (!user) {
      res
        .status(401)
        .json(buildErrorPayload('UNAUTHENTICATED', 'Sessão expirada ou inválida.', undefined, res.locals.requestId));
      return;
    }

    if (hasRequiredRole(user.role, allowedRoles)) {
      next();
      return;
    }

    res
      .status(403)
      .json(
        buildErrorPayload(
          'FORBIDDEN',
          'Você não possui permissões suficientes para acessar este recurso.',
          undefined,
          res.locals.requestId,
        ),
      );
  };
}

export function requireSelfOrRole(paramName: string, ...allowed: string[]) {
  const allowedRoles = normalizeRoles(allowed.length > 0 ? allowed : ['admin']);

  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.authUser ?? req.authUser;

    if (!user) {
      res
        .status(401)
        .json(buildErrorPayload('UNAUTHENTICATED', 'Sessão expirada ou inválida.', undefined, res.locals.requestId));
      return;
    }

    if (req.params?.[paramName] && req.params[paramName] === user.id) {
      next();
      return;
    }

    if (hasRequiredRole(user.role, allowedRoles)) {
      next();
      return;
    }

    res
      .status(403)
      .json(
        buildErrorPayload(
          'FORBIDDEN',
          'Você não possui permissões suficientes para executar esta operação.',
          undefined,
          res.locals.requestId,
        ),
      );
  };
}

export default requireRole;
