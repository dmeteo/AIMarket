import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { orderService, type OrderRequest, type OrderResponse } from '../services/order.service';
import { useCartStore } from '../store/cart.store';

export function useCheckout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation<OrderResponse, Error, OrderRequest>({
    mutationFn: (data) => orderService.createOrder(data),
    onSuccess: (response) => {
      // Invalidate orders cache so /profile/orders shows the new order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Clear the cart
      clearCart();
      // Redirect to success page
      router.push(`/checkout/success?order_id=${response.order.id}`);
    },
  });
}
