import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants.js";

export interface OffsetPaginationParams {
  page: number;
  pageSize: number;
}

export interface OffsetPaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OffsetPaginatedResult<T> {
  data: T[];
  meta: OffsetPaginationMeta;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  direction?: "forward" | "backward";
}

export interface CursorPaginationMeta {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

/**
 * Normalize and clamp offset pagination parameters from query string values.
 */
export function parseOffsetParams(query: {
  page?: string | number;
  pageSize?: string | number;
}): OffsetPaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const rawSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, rawSize), MAX_PAGE_SIZE);
  return { page, pageSize };
}

/**
 * Build offset pagination metadata from a total count and current params.
 */
export function buildOffsetMeta(
  totalCount: number,
  params: OffsetPaginationParams,
): OffsetPaginationMeta {
  const totalPages = Math.ceil(totalCount / params.pageSize);
  return {
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}

/**
 * Compute Prisma skip/take from offset pagination params.
 */
export function toOffsetPrismaArgs(params: OffsetPaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

/**
 * Normalize cursor pagination parameters from query string values.
 */
export function parseCursorParams(query: {
  cursor?: string;
  limit?: string | number;
  direction?: string;
}): CursorPaginationParams {
  const rawLimit = Number(query.limit) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(1, rawLimit), MAX_PAGE_SIZE);
  const direction =
    query.direction === "backward" ? "backward" : "forward";
  return {
    cursor: query.cursor || undefined,
    limit,
    direction,
  };
}

/**
 * Build cursor pagination result from a fetched array.
 * Expects the caller to fetch limit + 1 items to detect hasNextPage.
 * Each item must have an `id` field used as the cursor.
 */
export function buildCursorResult<T extends { id: string }>(
  items: T[],
  params: CursorPaginationParams,
): CursorPaginatedResult<T> {
  const hasExtra = items.length > params.limit;
  const data = hasExtra ? items.slice(0, params.limit) : items;

  const hasNextPage =
    params.direction === "forward" ? hasExtra : !!params.cursor;
  const hasPreviousPage =
    params.direction === "forward" ? !!params.cursor : hasExtra;

  return {
    data,
    meta: {
      hasNextPage,
      hasPreviousPage,
      startCursor: data.length > 0 ? data[0]!.id : null,
      endCursor: data.length > 0 ? data[data.length - 1]!.id : null,
    },
  };
}

/**
 * Compute Prisma cursor/take args for cursor-based pagination.
 */
export function toCursorPrismaArgs(params: CursorPaginationParams): {
  take: number;
  skip?: number;
  cursor?: { id: string };
} {
  const take =
    params.direction === "backward"
      ? -(params.limit + 1)
      : params.limit + 1;

  if (!params.cursor) {
    return { take };
  }

  return {
    take,
    skip: 1,
    cursor: { id: params.cursor },
  };
}
