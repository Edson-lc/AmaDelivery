import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import prisma from './lib/prisma';
import requestLogger from './middleware/requestLogger';
import { globalRateLimiter } from './middleware/rateLimiter';
import { env } from './env';
import routes from './routes';
import { buildErrorPayload, mapUnknownError } from './utils/errors';
import { logger } from './lib/logger';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type OriginMatcher = (origin: string) => boolean;

function createOriginMatcher(pattern: string): OriginMatcher {
  if (pattern === '*') {
    return () => true;
  }

  if (pattern.startsWith('regex:')) {
    try {
      const regex = new RegExp(pattern.slice(6));
      return (origin) => regex.test(origin);
    } catch (error) {
      logger.warn('Failed to compile CORS origin regex', {
        pattern,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  if (pattern.includes('*')) {
    const regex = new RegExp(`^${pattern.split('*').map(escapeRegExp).join('.*')}$`, 'i');
    return (origin) => regex.test(origin);
  }

  return (origin) => origin === pattern;
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const originMatchers = env.ALLOWED_ORIGINS.map(createOriginMatcher);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = originMatchers.some((matcher) => matcher(origin));

    if (isAllowed) {
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

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(globalRateLimiter);
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ limit: env.REQUEST_BODY_LIMIT, extended: true }));

app.get('/health', async (_req, res) => {
  let databaseStatus: 'up' | 'down' = 'up';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseStatus = 'down';
    logger.error('Database health check failed', {
      requestId: res.locals.requestId,
      error: error instanceof Error ? error.message : error,
    });
  }

  res.status(databaseStatus === 'up' ? 200 : 503).json({
    status: 'ok',
    uptime: process.uptime(),
    database: databaseStatus,
    env: { port: env.PORT, nodeEnv: env.NODE_ENV },
  });
});

app.use('/api', routes);

app.use((req, res) => {
  res
    .status(404)
    .json(
      buildErrorPayload('NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} not found`, undefined, res.locals.requestId),
    );
});

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const appError = mapUnknownError(error);
  const shouldIncludeStack = env.NODE_ENV === 'development' && error instanceof Error;

  logger.error('Unhandled application error', {
    method: req.method,
    path: req.originalUrl,
    status: appError.status,
    code: appError.code,
    requestId: res.locals.requestId,
    ...(appError.details ? { details: appError.details } : {}),
    ...(shouldIncludeStack ? { stack: (error as Error).stack } : {}),
  });

  res
    .status(appError.status)
    .json(buildErrorPayload(appError.code, appError.message, appError.details, res.locals.requestId));
});

export default app;
