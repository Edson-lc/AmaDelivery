import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

if (!DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Prisma operations will fail until it is provided.');
}

if (!JWT_SECRET) {
  throw new Error('[env] JWT_SECRET is required but was not provided.');
}

export const env = {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
