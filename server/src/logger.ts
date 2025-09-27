const isDevelopment = process.env.NODE_ENV !== 'production';

interface ErrorLogContext {
  code: string;
  message: string;
  status: number;
  requestId?: string | string[];
  method?: string;
  path?: string;
  details?: unknown;
  error?: unknown;
}

function normalizeRequestId(requestId?: string | string[]): string | undefined {
  if (!requestId) {
    return undefined;
  }

  if (Array.isArray(requestId)) {
    return requestId[0];
  }

  return requestId;
}

export const logger = {
  error(context: ErrorLogContext): void {
    const payload: Record<string, unknown> = {
      level: 'error',
      timestamp: new Date().toISOString(),
      code: context.code,
      message: context.message,
      status: context.status,
      ...(context.requestId ? { requestId: normalizeRequestId(context.requestId) } : {}),
      ...(context.method ? { method: context.method } : {}),
      ...(context.path ? { path: context.path } : {}),
    };

    if (isDevelopment) {
      const devPayload: Record<string, unknown> = {};

      if (context.details !== undefined) {
        devPayload.details = context.details;
      }

      if (context.error instanceof Error) {
        devPayload.error = {
          name: context.error.name,
          stack: context.error.stack,
        };
      } else if (context.error !== undefined) {
        devPayload.error = context.error;
      }

      if (Object.keys(devPayload).length > 0) {
        payload.dev = devPayload;
      }
    }

    console.error(JSON.stringify(payload));
  },
};

export type { ErrorLogContext };
