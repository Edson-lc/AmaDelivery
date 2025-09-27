import dotenv from 'dotenv';

dotenv.config();

type NodeEnvironment = 'development' | 'production' | 'test';

const RAW_NODE_ENV = process.env.NODE_ENV;
const NODE_ENV: NodeEnvironment =
  RAW_NODE_ENV === 'production' ? 'production' : RAW_NODE_ENV === 'test' ? 'test' : 'development';

const PORT = Number(process.env.PORT ?? 4000);
const RAW_DATABASE_URL = process.env.DATABASE_URL ?? '';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const REQUEST_BODY_LIMIT = process.env.REQUEST_BODY_LIMIT?.trim() || '500kb';

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

function parseBoolean(value: string | undefined, fallback: boolean, variableName: string): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'y', 'sim'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'n', 'nao', 'não'].includes(normalized)) {
    return false;
  }

  console.warn(`[env] Invalid boolean for ${variableName}. Falling back to ${fallback}.`);
  return fallback;
}

function parseSameSite(
  value: string | undefined,
  fallback: 'lax' | 'strict' | 'none',
  variableName: string,
): 'lax' | 'strict' | 'none' {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'lax' || normalized === 'strict' || normalized === 'none') {
    return normalized;
  }

  console.warn(`[env] Invalid SameSite value for ${variableName}. Falling back to ${fallback}.`);
  return fallback;
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

const GLOBAL_RATE_LIMIT_WINDOW_MS = parsePositiveInteger(
  process.env.GLOBAL_RATE_LIMIT_WINDOW_MS,
  60 * 1000,
  'GLOBAL_RATE_LIMIT_WINDOW_MS',
);

const GLOBAL_RATE_LIMIT_MAX = parsePositiveInteger(
  process.env.GLOBAL_RATE_LIMIT_MAX,
  120,
  'GLOBAL_RATE_LIMIT_MAX',
);

const ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME?.trim() || 'amaeats_access_token';
const ACCESS_TOKEN_COOKIE_DOMAIN = process.env.ACCESS_TOKEN_COOKIE_DOMAIN?.trim() || undefined;
const ACCESS_TOKEN_COOKIE_PATH = process.env.ACCESS_TOKEN_COOKIE_PATH?.trim() || '/';
const ACCESS_TOKEN_COOKIE_SECURE = parseBoolean(
  process.env.ACCESS_TOKEN_COOKIE_SECURE,
  NODE_ENV === 'production',
  'ACCESS_TOKEN_COOKIE_SECURE',
);

const ACCESS_TOKEN_COOKIE_SAME_SITE = parseSameSite(
  process.env.ACCESS_TOKEN_COOKIE_SAME_SITE,
  ACCESS_TOKEN_COOKIE_SECURE ? 'none' : 'lax',
  'ACCESS_TOKEN_COOKIE_SAME_SITE',
);

const ACCESS_TOKEN_COOKIE_MAX_AGE_MS = parsePositiveInteger(
  process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
  60 * 60 * 1000,
  'ACCESS_TOKEN_COOKIE_MAX_AGE_MS',
);

if (!RAW_DATABASE_URL) {
  throw new Error('[env] DATABASE_URL must be defined. Set it in your environment configuration.');
}

if (!JWT_SECRET) {
  throw new Error('[env] JWT_SECRET must be defined. Set it in your environment configuration.');
}

const DATABASE_URL = RAW_DATABASE_URL;

if (!ACCESS_TOKEN_COOKIE_SECURE && ACCESS_TOKEN_COOKIE_SAME_SITE === 'none') {
  console.warn(
    '[env] ACCESS_TOKEN_COOKIE_SAME_SITE is set to "none" but ACCESS_TOKEN_COOKIE_SECURE is disabled. Browsers will reject the cookie. Consider enabling HTTPS in development or adjust the cookie settings.',
  );
}

export const env = {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ALLOWED_ORIGINS,
  REQUEST_BODY_LIMIT,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
  GLOBAL_RATE_LIMIT_WINDOW_MS,
  GLOBAL_RATE_LIMIT_MAX,
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_DOMAIN,
  ACCESS_TOKEN_COOKIE_PATH,
  ACCESS_TOKEN_COOKIE_SECURE,
  ACCESS_TOKEN_COOKIE_SAME_SITE,
  ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
};
