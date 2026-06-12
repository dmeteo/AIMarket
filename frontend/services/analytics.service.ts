import api from '../lib/api';

export interface AnalyticsPeriod {
  from: string;
  to: string;
}

export interface AnalyticsSummary {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
}

export interface SalesByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusDistribution {
  code: string;
  label: string;
  count: number;
}

export interface TopProduct {
  id: number;
  title: string;
  sales: number;
  revenue: number;
}

export interface RevenueByShop {
  shop_id: number;
  shop_name: string;
  revenue: number;
}

export interface CustomerStats {
  new: number;
  returning: number;
  total: number;
}

export interface AnalyticsResponse {
  period: AnalyticsPeriod;
  summary: AnalyticsSummary;
  sales_by_day: SalesByDay[];
  status_distribution: StatusDistribution[];
  top_products: TopProduct[];
  revenue_by_shop: RevenueByShop[];
  customers: CustomerStats;
}

export interface AnalyticsParams {
  period?: string;
  shop_ids?: number[];
  from?: string;
  to?: string;
}

export const analyticsService = {
  async getSellerAnalytics(sellerId: number, params?: AnalyticsParams): Promise<AnalyticsResponse> {
    const response = await api.get<AnalyticsResponse>(`/api/v1/seller/${sellerId}/analytics`, {
      params: {
        period: params?.period || 'month',
        ...(params?.shop_ids?.length ? { shop_ids: params.shop_ids.join(',') } : {}),
        ...(params?.from ? { from: params.from } : {}),
        ...(params?.to ? { to: params.to } : {}),
      },
    });
    return response.data;
  },
};
