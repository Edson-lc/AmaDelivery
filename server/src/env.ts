import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_URL = process.env.DATABASE_URL ?? '';

if (!DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Prisma operations will fail until it is provided.');
}

export const env = {
  PORT,
  DATABASE_URL,
};
