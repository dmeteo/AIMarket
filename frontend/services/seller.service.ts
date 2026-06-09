import api from '../lib/api';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SellerData {
  name: string;
  email: string;
  phone: string;
  about: string;
}

export interface LegalData {
  entityType: string;
  inn: string;
  ogrn: string;
  legalAddress: string;
  bankBik: string;
  bankAccount: string;
}

export interface SellerApplication {
  id: number;
  userId: number;
  status: ApplicationStatus;
  sellerData: SellerData;
  legalData: LegalData;
  rejectionReason: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  sellerData: SellerData;
  legalData: LegalData;
}

export interface SellerShop {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  logo_url: string | null;
  products_count: number;
  orders_count: number;
  revenue: number;
  is_active: boolean;
  created_at: string;
}

export interface SellerOrder {
  id: number;
  items: Array<{
    product: {
      id: number;
      title: string;
    };
    quantity: number;
  }>;
  total_price: string;
  status: { code: string; label: string };
  createdAt: string;
}

export const sellerService = {
  // Applications
  async getApplications(): Promise<SellerApplication[]> {
    const response = await api.get<SellerApplication[]>('/api/v1/admin/seller-applications');
    return response.data;
  },

  async getApplication(id: number): Promise<SellerApplication> {
    const response = await api.get<SellerApplication>(`/api/v1/admin/seller-applications/${id}`);
    return response.data;
  },

  async createApplication(data: CreateApplicationRequest): Promise<SellerApplication> {
    const response = await api.post<SellerApplication>('/api/v1/seller-applications/create', data);
    return response.data;
  },

  async approveApplication(id: number): Promise<SellerApplication> {
    const response = await api.patch<SellerApplication>(`/api/v1/admin/seller-applications/${id}/approve`);
    return response.data;
  },

  async rejectApplication(id: number, reason: string): Promise<SellerApplication> {
    const response = await api.patch<SellerApplication>(`/api/v1/admin/seller-applications/${id}/reject`, { reason });
    return response.data;
  },

  async getMyApplication(userId: number): Promise<SellerApplication | null> {
    try {
      const response = await api.get<SellerApplication[]>('/api/v1/seller-applications', { params: { userId } });
      return response.data[0] ?? null;
    } catch {
      return null;
    }
  },

  // Shops CRUD
  async getSellerShops(sellerId: number): Promise<SellerShop[]> {
    const response = await api.get<SellerShop[]>(`/api/v1/seller/${sellerId}/shops`);
    return response.data;
  },

  async getShop(shopId: number): Promise<SellerShop> {
    const response = await api.get<SellerShop>(`/api/v1/shops/${shopId}`);
    return response.data;
  },

  async createShop(data: { name: string; description?: string; logo_url?: string }): Promise<SellerShop> {
    const response = await api.post<SellerShop>('/api/v1/shops/', data);
    return response.data;
  },

  async updateShop(shopId: number, data: Partial<{ name: string; description: string; logo_url: string; is_active: boolean }>): Promise<SellerShop> {
    const response = await api.patch<SellerShop>(`/api/v1/shops/${shopId}`, data);
    return response.data;
  },

  async deleteShop(shopId: number): Promise<{ id: number }> {
    const response = await api.delete<{ id: number }>(`/api/v1/shops/${shopId}`);
    return response.data;
  },

  // Seller orders
  async getSellerOrders(sellerId: number): Promise<SellerOrder[]> {
    const response = await api.get<SellerOrder[]>(`/api/v1/seller/${sellerId}/orders`);
    return response.data;
  },

  // Seller products (across all shops)
  async getSellerProducts(sellerId: number): Promise<unknown[]> {
    const response = await api.get<unknown[]>(`/api/v1/seller/${sellerId}/products`);
    return response.data;
  },
};
