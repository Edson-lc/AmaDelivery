import app from './app';
import { env } from './env';
import prisma from './lib/prisma';
import { logger } from './lib/logger';

const port = env.PORT || 4000;

const server = app.listen(port, () => {
  logger.info('AmaDelivery API running', { port, nodeEnv: env.NODE_ENV });
});

async function shutdown(signal: NodeJS.Signals | 'uncaughtException' | 'unhandledRejection', error?: unknown) {
  logger.warn('Shutting down application', {
    signal,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : undefined,
  });

  await new Promise<void>((resolve) => {
    server.close(() => {
      logger.info('HTTP server closed');
      resolve();
    });
  });

  await prisma
    .$disconnect()
    .then(() => logger.info('Prisma client disconnected'))
    .catch((disconnectError) => {
      logger.error('Failed to disconnect Prisma client', {
        error: disconnectError instanceof Error ? disconnectError.message : disconnectError,
      });
    });

  process.exit(error ? 1 : 0);
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    void shutdown(signal);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason,
  });
  void shutdown('unhandledRejection', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack });
  void shutdown('uncaughtException', error);
});
