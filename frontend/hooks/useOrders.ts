import { useQuery } from '@tanstack/react-query';
import { orderService, type Order, type OrdersResponse } from '../services/order.service';

export const useOrders = (enabled = true) => {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
    enabled: enabled && (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== 'true'),
  });
};

export const useOrder = (id: number) => {
  return useQuery<Order, Error>({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await orderService.getOrder(id);
      return response;
    },
    enabled: !!id,
  });
};
