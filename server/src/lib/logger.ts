type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: unknown;
}

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
const activeLevel: LogLevel = levelOrder[configuredLevel] ? configuredLevel : 'info';

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[activeLevel];
}

function serializeLog(level: LogLevel, message: string, metadata?: LogMetadata): string {
  const payload: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (metadata && Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }

  return JSON.stringify(payload);
}

function log(level: LogLevel, message: string, metadata?: LogMetadata): void {
  if (!shouldLog(level)) {
    return;
  }

  const serialized = serializeLog(level, message, metadata);

  switch (level) {
    case 'error':
      console.error(serialized);
      break;
    case 'warn':
      console.warn(serialized);
      break;
    default:
      console.log(serialized);
      break;
  }
}

export const logger = {
  debug(message: string, metadata?: LogMetadata) {
    log('debug', message, metadata);
  },
  info(message: string, metadata?: LogMetadata) {
    log('info', message, metadata);
  },
  warn(message: string, metadata?: LogMetadata) {
    log('warn', message, metadata);
  },
  error(message: string, metadata?: LogMetadata) {
    log('error', message, metadata);
  },
};

export type { LogMetadata };
