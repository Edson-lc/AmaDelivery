import { NextFunction, Request, Response } from 'express';
import authenticate from './authenticate';

const PUBLIC_ROUTES: { methods: string[]; pattern: RegExp }[] = [
  { methods: ['GET', 'OPTIONS'], pattern: /^\/restaurants(?:\/.*)?$/ },
  { methods: ['GET', 'OPTIONS'], pattern: /^\/menu-items(?:\/.*)?$/ },
];

export default function authenticateUnlessPublic(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const path = req.path || '';
  const method = req.method;

  const isPublic = PUBLIC_ROUTES.some(({ methods, pattern }) => {
    const matchesMethod = methods.includes(method);
    return matchesMethod && pattern.test(path);
  });

  if (isPublic) {
    return next();
  }

  return authenticate(req, res, next);
}
