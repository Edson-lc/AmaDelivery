import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';

if (!DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Prisma operations will fail until it is provided.');
}

if (!STRIPE_SECRET_KEY) {
  console.warn('[env] STRIPE_SECRET_KEY is not set. Payment operations will be disabled.');
}

export const env = {
  PORT,
  DATABASE_URL,
  STRIPE_SECRET_KEY,
};
