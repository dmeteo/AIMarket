'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Header from '../../../../components/Header';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Skeleton from '../../../../components/ui/Skeleton';
import { useOrder } from '../../../../hooks/useOrders';
import type { OrderStatusCode } from '../../../../services/order.service';

const STATUS_TIMELINE: { code: OrderStatusCode; label: string; icon: typeof CheckCircle }[] = [
  { code: 'IN_PROCESSING', label: 'Оформлен', icon: CheckCircle },
  { code: 'CONFIRMED', label: 'Подтверждён', icon: CheckCircle },
  { code: 'AWAITING_DELIVERY', label: 'Передан в доставку', icon: Truck },
  { code: 'DELIVERY', label: 'В пути', icon: Truck },
  { code: 'AWAIT_RECEIPT', label: 'Ожидает получения', icon: Package },
  { code: 'RECEIVED', label: 'Получен', icon: CheckCircle },
];

const ACTION_BUTTONS: Record<string, { label: string; variant: 'primary' | 'secondary' | 'destructive' } | null> = {
  IN_PROCESSING: { label: 'Отменить заказ', variant: 'destructive' },
  CONFIRMED: { label: 'Отменить заказ', variant: 'destructive' },
  AWAITING_DELIVERY: { label: 'Отследить посылку', variant: 'secondary' },
  DELIVERY: { label: 'Отследить посылку', variant: 'secondary' },
  AWAIT_RECEIPT: { label: 'Подтвердить получение', variant: 'primary' },
  RECEIVED: null,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const { data: order, isLoading, isError } = useOrder(id);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error / not found
  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ не найден</h1>
            <p className="text-gray-600 mb-8">
              Заказ с номером #{params.id} не существует или был удалён.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              К заказам
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statusCode = (order.status?.code ?? 'IN_PROCESSING') as OrderStatusCode;
  const statusLabel = order.status?.label ?? 'Обработка';
  const currentStepIndex = STATUS_TIMELINE.findIndex((s) => s.code === statusCode);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const actionButton = ACTION_BUTTONS[statusCode];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/profile/orders"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            К заказам
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Заказ #{order.id}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant={
                    statusCode === 'RECEIVED'
                      ? 'success'
                      : statusCode === 'DELIVERY' || statusCode === 'AWAITING_DELIVERY'
                        ? 'warning'
                        : statusCode === 'CONFIRMED'
                          ? 'primary'
                          : 'muted'
                  }
                >
                  {statusLabel}
                </Badge>
                {order.predicted_date && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Ожидаемая дата: {formatDate(order.predicted_date)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  Состав заказа ({itemCount} {itemCount === 1 ? 'товар' : 'товаров'})
                </h2>

                {order.items.length === 0 ? (
                  <p className="text-sm text-gray-500">Информация о товарах недоступна</p>
                ) : (
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <Link
                          href={`/product/${item.product.id}`}
                          className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100"
                        >
                          <Image
                            src={item.product.images?.[0] ?? '/placeholder.svg'}
                            alt={item.product.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.product.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-gray-600 line-clamp-1"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {parseFloat(item.product.final_price).toFixed(0)} ₽ × {item.quantity} шт.
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                          {(parseFloat(item.product.final_price) * item.quantity).toFixed(0)} ₽
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-600" />
                  Доставка
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Адрес</p>
                      <p className="text-sm text-gray-900">{order.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Truck className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Стоимость</p>
                      <p className="text-sm text-gray-900">
                        {order.delivery_cost === '0' ? 'Бесплатно' : `${order.delivery_cost} ₽`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Статус заказа
                </h2>
                <div className="space-y-0">
                  {STATUS_TIMELINE.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.code} className="flex gap-3">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-zinc-900 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          {index < STATUS_TIMELINE.length - 1 && (
                            <div
                              className={`w-0.5 h-8 ${
                                isCompleted ? 'bg-zinc-900' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>
                        {/* Label */}
                        <div className="pb-6">
                          <p
                            className={`text-sm ${
                              isCurrent
                                ? 'font-semibold text-gray-900'
                                : isCompleted
                                  ? 'text-gray-600'
                                  : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column — summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Итого</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Товары ({itemCount} шт.)
                    </span>
                    <span className="text-gray-900">{order.items_total_price} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Доставка</span>
                    <span className="text-gray-900">
                      {order.delivery_cost === '0' ? 'Бесплатно' : `${order.delivery_cost} ₽`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-gray-900">Итого</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {order.final_price} ₽
                    </span>
                  </div>
                </div>

                {actionButton && (
                  <Button
                    variant={actionButton.variant}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {actionButton.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
