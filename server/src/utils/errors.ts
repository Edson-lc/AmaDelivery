export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function buildErrorPayload(code: string, message: string, details?: unknown): { error: ErrorPayload } {
  return {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}

export function mapUnknownError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.message === 'Not allowed by CORS') {
    return new AppError(403, 'CORS_NOT_ALLOWED', 'A origem desta requisição não está autorizada.');
  }

  if (error instanceof Error) {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', error.message);
  }

  return new AppError(500, 'INTERNAL_SERVER_ERROR', 'Unexpected error');
}
