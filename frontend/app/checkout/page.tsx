'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Truck, Package, AlertCircle } from 'lucide-react';
import Header from '../../components/Header';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../store/cart.store';
import { useCheckout } from '../../hooks/useCheckout';
import type { DeliveryType } from '../../services/order.service';

const DELIVERY_OPTIONS: { type: DeliveryType; label: string; cost: number; description: string }[] = [
  { type: 'CDEK', label: 'CDEK', cost: 290, description: 'Пункт выдачи, 3–5 дней' },
  { type: 'YANDEX', label: 'Яндекс Доставка', cost: 199, description: 'Курьером, 1–2 дня' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, totalPrice } = useCartStore();
  const checkout = useCheckout();

  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('CDEK');
  const [addressError, setAddressError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect to cart if empty (but not while submitting or after successful order)
  useEffect(() => {
    if (!authLoading && isAuthenticated && items.length === 0 && !checkout.isPending && !checkout.isSuccess) {
      router.replace('/cart');
    }
  }, [authLoading, isAuthenticated, items.length, router, checkout.isPending, checkout.isSuccess]);

  const deliveryCost = DELIVERY_OPTIONS.find((o) => o.type === deliveryType)?.cost ?? 0;
  const itemsTotal = totalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    // Client-side validation
    if (!address.trim()) {
      setAddressError('Введите адрес доставки');
      return;
    }
    if (address.trim().length < 10) {
      setAddressError('Адрес должен содержать минимум 10 символов');
      return;
    }

    checkout.mutate({
      address: address.trim(),
      delivery_type: deliveryType,
    });
  };

  // Loading state — auth check
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart — shouldn't render but guard anyway
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Вернуться в корзину
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Оформление заказа</h1>

          {/* Error from API */}
          {checkout.isError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ошибка оформления заказа</p>
                <p className="text-sm mt-1">
                  {checkout.error?.message || 'Попробуйте ещё раз или вернитесь в корзину'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery address */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Адрес доставки</h2>
                  </div>
                  <Textarea
                    placeholder="Город, улица, дом, квартира..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (addressError) setAddressError(null);
                    }}
                    error={addressError ?? undefined}
                    disabled={checkout.isPending}
                  />
                </div>

                {/* Delivery type */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Способ доставки</h2>
                  </div>
                  <div className="space-y-3">
                    {DELIVERY_OPTIONS.map((option) => (
                      <label
                        key={option.type}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          deliveryType === option.type
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${checkout.isPending ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option.type}
                          checked={deliveryType === option.type}
                          onChange={() => setDeliveryType(option.type)}
                          className="h-4 w-4 text-zinc-900 border-gray-300 focus:ring-zinc-900"
                          disabled={checkout.isPending}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {option.cost} ₽
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Ваш заказ</h2>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {parseFloat(item.final_price).toFixed(0)} ₽
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                          {(parseFloat(item.final_price) * item.quantity).toFixed(0)} ₽
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Товары ({items.length})</span>
                      <span className="text-gray-900">{itemsTotal.toFixed(0)} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Доставка</span>
                      <span className="text-gray-900">{deliveryCost} ₽</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Итого</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-900">
                          {itemsTotal.toFixed(0)} ₽
                        </span>
                        <span className="text-sm text-gray-500 ml-1">+ {deliveryCost} ₽</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-base"
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? 'Оформление...' : 'Подтвердить заказ'}
                  </Button>

                  <Link
                    href="/cart"
                    className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
                  >
                    Вернуться в корзину
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
