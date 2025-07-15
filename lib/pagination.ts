import { DEFAULT_PAGINATION_LIMIT } from './constants';

export const getPaginationParams = async (
  searchParams: Promise<{ page?: string | number; limit?: string | number }>
) => {
  const { page, limit } = await searchParams;
  return {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : DEFAULT_PAGINATION_LIMIT,
  };
};
