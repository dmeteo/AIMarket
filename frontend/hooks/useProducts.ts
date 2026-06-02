import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import api from '../lib/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  rating?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  discountPercentage?: number;
}

export interface GetProductsResponse {
  items: Product[];
  hasNextPage: boolean;
}

export const useProducts = (limit = 10) => {
  return useInfiniteQuery<
    GetProductsResponse,
    Error,
    InfiniteData<GetProductsResponse>,
    readonly string[],
    number
  >({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get('/api/products', {
        params: {
          page: pageParam + 1,
          limit,
        }
      });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};
