'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import Header from '../../../components/Header';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import { useOrder } from '../../../hooks/useOrders';
import { useCartStore } from '../../../store/cart.store';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const clearCart = useCartStore((s) => s.clearCart);

  const orderIdNum = orderId ? parseInt(orderId, 10) : 0;
  const { data: order, isLoading, isError } = useOrder(orderIdNum);

  // Ensure cart is cleared (in case user navigated here directly)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // If no order_id in URL, redirect to home
  useEffect(() => {
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Не удалось загрузить заказ
            </h1>
            <p className="text-gray-600 mb-8">
              Попробуйте проверить заказ в разделе «Мои заказы»
            </p>
            <Link href="/profile/orders">
              <Button variant="primary">Мои заказы</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusLabel = order.status?.label ?? 'Обработка';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Success header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Заказ оформлен!
            </h1>
            <p className="text-gray-600">
              Заказ #{order.id} успешно создан. Статус: {statusLabel}
            </p>
          </div>

          {/* Order details card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              Детали заказа
            </h2>

            {/* Delivery info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Адрес</p>
                <p className="text-sm text-gray-900">{order.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Доставка</p>
                <p className="text-sm text-gray-900">
                  {order.delivery_cost === '0' ? 'Бесплатно' : `${order.delivery_cost} ₽`}
                  {order.predicted_date && (
                    <span className="text-gray-500 ml-1">
                      (ожид. {new Date(order.predicted_date).toLocaleDateString('ru-RU')})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Состав заказа</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {(parseFloat(item.product.final_price) * item.quantity).toFixed(0)} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">Итого</span>
                <span className="text-lg font-bold text-gray-900">
                  {parseFloat(order.final_price).toFixed(0)} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/profile/orders" className="flex-1">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                Мои заказы
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
