import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';

interface RequestWithId extends Request {
  requestId?: string;
}

function getElapsedMilliseconds(startedAt: bigint): number {
  const diff = Number(process.hrtime.bigint() - startedAt);
  return Math.round((diff / 1_000_000) * 100) / 100;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestIdHeader = (req.headers['x-request-id'] ?? req.headers['x-requestid']) as string | undefined;
  const requestId = requestIdHeader?.trim() || randomUUID();
  (req as RequestWithId).requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startedAt = process.hrtime.bigint();

  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on('finish', () => {
    const durationMs = getElapsedMilliseconds(startedAt);
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      contentLength: res.getHeader('content-length'),
    });
  });

  res.on('close', () => {
    if (!res.writableEnded) {
      const durationMs = getElapsedMilliseconds(startedAt);
      logger.warn('Request closed before response was sent', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        durationMs,
      });
    }
  });

  next();
}

export default requestLogger;
