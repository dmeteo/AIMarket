import api from '../lib/api';

export interface ProductCard {
  id: number;
  title: string;
  images: string[];
  price: string;
  discount_percent: string;
  final_price: string;
  rating: number | null;
  reviews_count: number;
  quantity: number;
}

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
  category_id: number | null;
  category: string | null;
  is_active: boolean;
  shop_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: ProductCard[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  images?: string[];
  price: string | number;
  discount_percent?: number;
  final_price?: string;
  quantity?: number;
  category_id?: number;
  is_active?: boolean;
  shop_ids?: number[];
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  images?: string[];
  price?: string | number;
  discount_percent?: number;
  final_price?: string;
  quantity?: number;
  category_id?: number;
  is_active?: boolean;
}

export interface ShopProductLink {
  shop_id: number;
  product_id: number;
  price_override: string | null;
  stock: number;
}

export const productService = {
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post<Product>('/api/v1/products/', data);
    return response.data;
  },

  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await api.patch<Product>(`/api/v1/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<{ id: number }> {
    const response = await api.delete<{ id: number }>(`/api/v1/products/${id}`);
    return response.data;
  },

  async assignToShops(productId: number, shopIds: number[], priceOverrides?: Record<number, string>): Promise<Product> {
    const response = await api.post<Product>(`/api/v1/products/${productId}/assign`, {
      shop_ids: shopIds,
      price_overrides: priceOverrides,
    });
    return response.data;
  },

  async removeFromShop(productId: number, shopId: number): Promise<{ shop_id: number; product_id: number }> {
    const response = await api.delete<{ shop_id: number; product_id: number }>(
      `/api/v1/shops/${shopId}/products/${productId}`,
    );
    return response.data;
  },

  async getProductsByShop(shopId: number): Promise<ProductCard[]> {
    // Filter client-side from all products by shop_id
    const allProducts = await api.get<{ items: ProductCard[] }>('/api/products?limit=100');
    return allProducts.data.items.filter((p: ProductCard & { shop_ids?: number[] }) =>
      p.shop_ids?.includes(shopId),
    );
  },
};
