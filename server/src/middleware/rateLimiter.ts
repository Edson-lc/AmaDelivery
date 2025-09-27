import rateLimit from 'express-rate-limit';
import { env } from '../env';
import { buildErrorPayload } from '../utils/errors';

export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(buildErrorPayload('RATE_LIMIT_EXCEEDED', 'Limite de tentativas excedido. Tente novamente mais tarde.'));
  },
});

export default authRateLimiter;
