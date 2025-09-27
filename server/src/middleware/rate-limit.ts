import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { buildErrorPayload } from '../utils/errors';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

export const loginRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS,
  max: MAX_LOGIN_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip,
  handler: (req, res) => {
    const retryAfter = Math.ceil(FIFTEEN_MINUTES_IN_MS / 1000);
    console.warn('[RateLimit] Login limiter triggered', {
      ip: req.ip,
      path: req.originalUrl,
      limit: MAX_LOGIN_ATTEMPTS,
      windowMs: FIFTEEN_MINUTES_IN_MS,
    });

    res
      .status(429)
      .setHeader('Retry-After', String(retryAfter))
      .json(
        buildErrorPayload(
          'RATE_LIMITED',
          'Muitas tentativas de login. Tente novamente em alguns minutos.',
        ),
      );
  },
});
