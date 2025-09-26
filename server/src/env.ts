import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';

const rawSecret = process.env.JWT_SECRET;
const fallbackSecretSources = [process.env.JWT_SECRET_FALLBACKS, process.env.JWT_SECRET_PREVIOUS]
  .filter(Boolean)
  .join(',');
const JWT_SECRET_FALLBACKS = fallbackSecretSources
  .split(',')
  .map((secret) => secret.trim())
  .filter((secret) => secret.length > 0);

let JWT_SECRET = rawSecret;

if (!rawSecret) {
  if (IS_PRODUCTION) {
    throw new Error('JWT_SECRET must be provided in production environments.');
  }
  JWT_SECRET = 'dev-secret-change-me';
  console.warn('[env] JWT_SECRET is not set. Falling back to insecure development secret.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? (IS_PRODUCTION ? '15m' : '1h');

const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? '30');

if (Number.isNaN(REFRESH_TOKEN_TTL_DAYS) || REFRESH_TOKEN_TTL_DAYS <= 0) {
  throw new Error('REFRESH_TOKEN_TTL_DAYS must be a positive number.');
}

if (!DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Prisma operations will fail until it is provided.');
}

export const env = {
  NODE_ENV,
  IS_PRODUCTION,
  PORT,
  DATABASE_URL,
  JWT_SECRET: JWT_SECRET as string,
  JWT_SECRET_FALLBACKS,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_TTL_DAYS,
};
