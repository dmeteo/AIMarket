import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import api from '../lib/api';

export interface ProductCategory {
  id: number;
  title: string;
}

// Product in list (from /api/v1/products/)
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
  quantity: number;
  categories?: ProductCategory[];  // может отсутствовать в моках
  isNew?: boolean;
  isBestSeller?: boolean;
  shop_ids?: number[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Full product page (from /api/v1/products/:id)
export type ProductPage = Product;

export interface GetProductsResponse {
  items: Product[];
  hasNextPage: boolean;
}

// Backend response format
interface BackendProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductsParams {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  shop_ids?: number[];
  [key: string]: unknown;
}

export const useProducts = (limit = 10, params?: ProductsParams) => {
  return useInfiniteQuery<
    GetProductsResponse,
    Error,
    InfiniteData<GetProductsResponse>,
    readonly string[],
    number
  >({
    queryKey: ['products', JSON.stringify(params)],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get<BackendProductsResponse>('/api/v1/products/', {
        params: {
          page: pageParam + 1,
          limit,
          ...params,
        },
      });
      // Map backend response to frontend format
      return {
        items: response.data.products,
        hasNextPage: response.data.page < response.data.pages,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length : undefined;
    },
    initialPageParam: 0,
    ...(typeof window === 'undefined' && process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true'
      ? { enabled: false }
      : {}),
  });
};

// Client-side filtering helper
export function filterProducts(
  products: Product[],
  filters: {
    category_id?: number;
    min_price?: number;
    max_price?: number;
    shop_ids?: number[];
  },
): Product[] {
  let result = [...products];

  if (filters.category_id !== undefined) {
    result = result.filter((p) =>
      p.categories?.some((c) => c.id === filters.category_id),
    );
  }

  if (filters.min_price !== undefined) {
    result = result.filter((p) => parseFloat(p.final_price) >= filters.min_price!);
  }

  if (filters.max_price !== undefined) {
    result = result.filter((p) => parseFloat(p.final_price) <= filters.max_price!);
  }

  if (filters.shop_ids !== undefined && filters.shop_ids.length > 0) {
    result = result.filter((p) => {
      if (!p.shop_ids || p.shop_ids.length === 0) return false;
      return filters.shop_ids!.some((sid) => p.shop_ids!.includes(sid));
    });
  }

  return result;
}

// Single product by ID
export const useProduct = (id: number) => {
  return useQuery<ProductPage, Error>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<ProductPage>(`/api/v1/products/${id}`);
      return response.data;
    },
    enabled: !!id,
    // Only fetch on client side when MSW is active
    ...(typeof window === 'undefined' && process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true'
      ? { enabled: false }
      : {}),
  });
};
