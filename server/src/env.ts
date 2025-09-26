import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

if (!DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Prisma operations will fail until it is provided.');
}

if (!process.env.JWT_SECRET) {
  console.warn('[env] JWT_SECRET is not set. Falling back to insecure development secret.');
}

export const env = {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
