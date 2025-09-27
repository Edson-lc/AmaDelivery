import express from 'express';
import cors, { type CorsOptions } from 'cors';
import { env } from './env';
import routes from './routes';
import { buildErrorPayload, mapUnknownError } from './utils/errors';
import { logger } from './lib/logger';

const app = express();

const allowedOrigins = new Set(env.ALLOWED_ORIGINS);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has('*') || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    logger.warn('Blocked request from unauthorized origin', { origin });
    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  exposedHeaders: ['X-Total-Count', 'X-Limit', 'X-Skip'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: { port: env.PORT } });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json(buildErrorPayload('NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} not found`));
});

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const appError = mapUnknownError(error);
  const shouldIncludeStack = env.NODE_ENV === 'development' && error instanceof Error;

  logger.error('Unhandled application error', {
    method: req.method,
    path: req.originalUrl,
    status: appError.status,
    code: appError.code,
    ...(appError.details ? { details: appError.details } : {}),
    ...(shouldIncludeStack ? { stack: (error as Error).stack } : {}),
  });

  res.status(appError.status).json(buildErrorPayload(appError.code, appError.message, appError.details));
});

export default app;
