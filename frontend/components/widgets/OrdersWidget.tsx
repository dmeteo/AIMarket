'use client';

import { useRouter } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import OrderCard from './OrderCard';
import Skeleton from '../ui/Skeleton';

const EXCLUDED_STATUSES = new Set(['RECEIVED']);

export default function OrdersWidget() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useOrders();

  // Don't show if not authenticated
  if (!isAuthenticated) return null;

  const activeOrders = (data?.orders ?? []).filter(
    (order) => {
      const code = order.status?.code ?? 'IN_PROCESSING';
      return !EXCLUDED_STATUSES.has(code);
    }
  );

  // Don't show if no active orders
  if (!isLoading && activeOrders.length === 0) return null;

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          Мои заказы
        </h2>
        {activeOrders.length > 3 && (
          <button
            onClick={() => router.push('/profile/orders')}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            Все заказы
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 w-72 h-52 rounded-xl" />
          ))}
        </div>
      ) : (
        /* Horizontal scroll */
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
