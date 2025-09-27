import dotenv from 'dotenv';

dotenv.config();

type NodeEnvironment = 'development' | 'production' | 'test';

const RAW_NODE_ENV = process.env.NODE_ENV;
const NODE_ENV: NodeEnvironment =
  RAW_NODE_ENV === 'production' ? 'production' : RAW_NODE_ENV === 'test' ? 'test' : 'development';

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function parsePositiveInteger(value: string | undefined, fallback: number, variableName: string): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(`[env] Invalid value for ${variableName}. Falling back to ${fallback}.`);
    return fallback;
  }

  return parsed;
}

const AUTH_RATE_LIMIT_WINDOW_MS = parsePositiveInteger(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000,
  'AUTH_RATE_LIMIT_WINDOW_MS',
);

const AUTH_RATE_LIMIT_MAX = parsePositiveInteger(
  process.env.AUTH_RATE_LIMIT_MAX,
  10,
  'AUTH_RATE_LIMIT_MAX',
);

if (!DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Prisma operations will fail until it is provided.');
}

if (!JWT_SECRET) {
  throw new Error('[env] JWT_SECRET must be defined. Set it in your environment configuration.');
}

export const env = {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ALLOWED_ORIGINS,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
};
