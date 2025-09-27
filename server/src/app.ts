import express from 'express';
import cors from 'cors';
import { env } from './env';
import routes from './routes';
import { buildErrorPayload, mapUnknownError } from './utils/errors';
import { logger } from './logger';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['X-Total-Count', 'X-Limit', 'X-Skip'],
  }),
);
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
  logger.error({
    error,
    code: appError.code,
    message: appError.message,
    status: appError.status,
    details: appError.details,
    requestId: req.headers['x-request-id'] as string | string[] | undefined,
    method: req.method,
    path: req.originalUrl,
  });
  res.status(appError.status).json(buildErrorPayload(appError.code, appError.message, appError.details));
});

export default app;
