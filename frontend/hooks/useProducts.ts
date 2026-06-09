import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import api from '../lib/api';

// Product in list (from /api/products)
export interface Product {
  id: number;
  shop_id: number;
  title: string;
  description: string;
  images: string[];
  price: string;
  discount_percent: string;
  final_price: string;
  rating: number | null;
  reviews_count: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  discountPercentage?: number;
  category?: string;
  category_id?: number | null;
  quantity: number;
  is_active?: boolean;
  shop_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

// Full product page (from /api/v1/products/:id)
export type ProductPage = Product;

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

// Single product by ID
export const useProduct = (id: number) => {
  return useQuery<ProductPage, Error>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<ProductPage>(`/api/v1/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
