'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, ChevronRight } from 'lucide-react';
import Header from '../../../components/Header';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../hooks/useAuth';
import { useOrders } from '../../../hooks/useOrders';
import type { Order, OrderStatusCode } from '../../../services/order.service';

const statusConfig: Record<OrderStatusCode, { label: string; variant: 'primary' | 'success' | 'warning' | 'destructive' | 'muted' }> = {
  IN_PROCESSING:     { label: 'Обработка',          variant: 'muted' },
  CONFIRMED:         { label: 'Подтверждён',        variant: 'primary' },
  AWAITING_DELIVERY: { label: 'Ожидает доставки',  variant: 'warning' },
  DELIVERY:          { label: 'В доставке',         variant: 'warning' },
  AWAIT_RECEIPT:     { label: 'Ожидает получения', variant: 'warning' },
  RECEIVED:          { label: 'Получен',            variant: 'success' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading: ordersLoading } = useOrders();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[Orders] No token, redirecting to /login');
      window.location.href = '/login';
    }
  }, [isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Назад в профиль
            </Link>
          </nav>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Мои заказы</h1>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h2>
              <p className="text-gray-500 mb-6">
                Оформите свой первый заказ в каталоге
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: Order) => {
                const statusCode = order.status?.code ?? 'IN_PROCESSING';
                const status = statusConfig[statusCode as OrderStatusCode] ?? { label: order.status?.label ?? 'Обработка', variant: 'muted' as const };
                const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                return (
                  <Link
                    key={order.id}
                    href={`/profile/orders/${order.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            Заказ #{order.id}
                          </h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {order.predicted_date ? formatDate(order.predicted_date) : '—'}
                          </span>
                          <span>
                            {itemCount} {itemCount === 1 ? 'товар' : 'товаров'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {order.final_price} ₽
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.items.slice(0, 3).map((item) => (
                        <span
                          key={item.product.id}
                          className="inline-flex items-center px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600"
                        >
                          {item.product.title}
                          {item.quantity > 1 && (
                            <span className="ml-1 text-gray-400">×{item.quantity}</span>
                          )}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{order.items.length - 3} ещё
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
