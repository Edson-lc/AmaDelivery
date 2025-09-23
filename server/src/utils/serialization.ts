import { Prisma } from '@prisma/client';

type Serializable = unknown;

export function serialize<T extends Serializable>(input: T): T {
  return transform(input) as T;
}

function transform(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map(transform);
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = transform(nested);
    }
    return result;
  }

  return value;
}
