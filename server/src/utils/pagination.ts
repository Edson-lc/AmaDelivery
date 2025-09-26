import { ErrorCode } from '../shared/error-codes';
import { AppError } from './errors';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export type PaginationParams = {
  limit?: number;
  skip?: number;
};

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const limitParam = query.limit ?? query.pageSize ?? query.take;
  const skipParam = query.skip ?? query.offset ?? query.page;

  let limit: number | undefined;
  let skip: number | undefined;

  if (limitParam !== undefined) {
    const parsed = Number(limitParam);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new AppError(400, ErrorCode.INVALID_PAGINATION, 'O parâmetro limit deve ser um número positivo.');
    }
    limit = Math.min(Math.trunc(parsed), MAX_LIMIT);
  }

  if (skipParam !== undefined) {
    const parsed = Number(skipParam);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new AppError(400, ErrorCode.INVALID_PAGINATION, 'O parâmetro skip deve ser um número maior ou igual a zero.');
    }
    skip = Math.trunc(parsed);
  }

  return {
    limit,
    skip,
  };
}

export function applyPaginationHeaders(
  res: import('express').Response,
  pagination: PaginationParams,
  total: number,
) {
  res.setHeader('X-Total-Count', total.toString());
  res.setHeader('X-Limit', (pagination.limit ?? total ?? DEFAULT_LIMIT).toString());
  res.setHeader('X-Skip', (pagination.skip ?? 0).toString());
}
