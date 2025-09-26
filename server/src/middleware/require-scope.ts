import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../shared/error-codes';
import { buildErrorPayload } from '../utils/errors';

type Scope = string;

function hasRequiredScopes(userScopes: Scope[], requiredScopes: Scope[]): boolean {
  if (userScopes.includes('*')) {
    return true;
  }
  return requiredScopes.every((scope) => userScopes.includes(scope));
}

export default function requireScope(scopes: Scope | Scope[]) {
  const requiredScopes = Array.isArray(scopes) ? scopes : [scopes];

  return function requireScopeMiddleware(req: Request, res: Response, next: NextFunction) {
    const userScopes = req.authUser?.scopes ?? [];

    if (!hasRequiredScopes(userScopes, requiredScopes)) {
      return res.status(403).json(buildErrorPayload(ErrorCode.INVALID_SCOPE, 'Permissão insuficiente.'));
    }

    return next();
  };
}
