import api from '../lib/api';

// ---- Types (aligned with OpenAPI) ----

export type DeliveryType = 'CDEK' | 'YANDEX';

export type OrderStatusCode =
  | 'IN_PROCESSING'
  | 'CONFIRMED'
  | 'AWAITING_DELIVERY'
  | 'DELIVERY'
  | 'AWAIT_RECEIPT'
  | 'RECEIVED';

export interface OrderStatusInfo {
  code: OrderStatusCode;
  label: string;
}

export interface ProductCard {
  id: number;
  title: string;
  images: string[];
  price: string;
  final_price: string;
  discount_percent: number | null;
  rating: number;
  quantity: number;
  category: string | null;
  is_new: boolean;
  is_bestseller: boolean;
}

export interface CartItem {
  product: ProductCard;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  items: CartItem[];
  address: string;
  delivery_cost: string;
  predicted_date: string;
  status: OrderStatusInfo;
  items_total_price: string;
  final_price: string;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface OrderRequest {
  address: string;
  delivery_type: DeliveryType;
}

export interface OrderResponse {
  order: Order;
}

// ---- API calls ----

export const orderService = {
  async getOrders(): Promise<OrdersResponse> {
    const response = await api.get<OrdersResponse>('/api/v1/orders/');
    return response.data;
  },

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<Order>(`/api/v1/orders/${id}`);
    return response.data;
  },

  async createOrder(data: OrderRequest): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>('/api/v1/orders/', data);
    return response.data;
  },
};
