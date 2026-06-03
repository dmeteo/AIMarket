import api from '../lib/api';
import type { CartItem } from '../store/cart.store';

export interface CartResponse {
  id: number;
  user_id: number;
  items: CartItem[];
  updated_at: string;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  product_id: number;
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get<CartResponse>('/api/v1/cart/');
    return response.data;
  },

  async addItem(data: AddToCartRequest): Promise<CartResponse> {
    const response = await api.post<CartResponse>('/api/v1/cart/items', data);
    return response.data;
  },

  async updateItem(data: UpdateCartItemRequest): Promise<CartResponse> {
    const response = await api.patch<CartResponse>(
      `/api/v1/cart/items/${data.product_id}`,
      data
    );
    return response.data;
  },

  async removeItem(productId: number): Promise<CartResponse> {
    const response = await api.delete<CartResponse>(`/api/v1/cart/items/${productId}`);
    return response.data;
  },
};
