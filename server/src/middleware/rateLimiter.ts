import type { Response } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../env';
import { buildErrorPayload } from '../utils/errors';

function rateLimitHandler(res: Response) {
  res
    .status(429)
    .json(
      buildErrorPayload(
        'RATE_LIMIT_EXCEEDED',
        'Limite de tentativas excedido. Tente novamente mais tarde.',
        undefined,
        res.locals.requestId,
      ),
    );
}

export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'anonymous',
  handler: (_req, res) => {
    rateLimitHandler(res);
  },
});

export const globalRateLimiter = rateLimit({
  windowMs: env.GLOBAL_RATE_LIMIT_WINDOW_MS,
  max: env.GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'anonymous',
  skip: (req) => req.path === '/health' || req.method === 'OPTIONS',
  handler: (_req, res) => {
    rateLimitHandler(res);
  },
});

export default authRateLimiter;
