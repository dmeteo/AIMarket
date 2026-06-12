'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, TrendingUp, Clock, CheckCircle, Truck, Store, Plus } from 'lucide-react';
import SellerLayout from '../../../components/seller/SellerLayout';
import MetricCard from '../../../components/analytics/widgets/MetricCard';
import { useAuth } from '../../../hooks/useAuth';
import { sellerService } from '../../../services/seller.service';
import Button from '../../../components/ui/Button';
import type { SellerOrder, SellerShop } from '../../../services/seller.service';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shops, setShops] = useState<SellerShop[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) window.location.href = '/login';
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [shopsData, ordersData] = await Promise.all([
        sellerService.getSellerShops(user!.id),
        sellerService.getSellerOrders(user!.id),
      ]);
      setShops(shopsData);
      setOrders(ordersData);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  const totalProducts = shops.reduce((sum, s) => sum + s.products_count, 0);
  const totalRevenue = shops.reduce((sum, s) => sum + s.revenue, 0);

  const statusIcon: Record<string, typeof Clock> = {
    IN_PROCESSING: Clock,
    CONFIRMED: CheckCircle,
    DELIVERY: Truck,
    RECEIVED: CheckCircle,
  };

  // Empty state — no shops
  if (shops.length === 0) {
    return (
      <SellerLayout title="Дашборд">
        <div className="text-center py-16">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Добро пожаловать!</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Создайте свой первый магазин, чтобы начать продавать товары на платформе.
          </p>
          <Button variant="primary" onClick={() => router.push('/seller/shops')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать первый магазин
          </Button>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title="Дашборд">
      <div className="space-y-6">
        {/* Shop cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Ваши магазины</h3>
            <button
              onClick={() => router.push('/seller/shops')}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Все магазины →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shops.slice(0, 3).map((shop) => (
              <button
                key={shop.id}
                onClick={() => router.push(`/seller/shops/${shop.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Store className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{shop.name}</p>
                    <p className="text-xs text-gray-500">{shop.products_count} товаров</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate">{shop.description || 'Нет описания'}</p>
              </button>
            ))}
            {shops.length < 10 && (
              <button
                onClick={() => router.push('/seller/shops')}
                className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50/50 transition-colors min-h-[100px]"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs font-medium">Новый магазин</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Магазины" value={shops.length} icon={Store} />
          <MetricCard title="Товары" value={totalProducts} icon={Package} />
          <MetricCard title="Заказы" value={orders.length} icon={ShoppingCart} trend={{ value: '+2 сегодня', positive: true }} />
          <MetricCard title="Выручка" value={`${totalRevenue.toLocaleString()} ₽`} icon={TrendingUp} trend={{ value: '+12%', positive: true }} />
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Последние заказы</h3>
            <button onClick={() => router.push('/seller/orders')} className="text-sm text-green-600 hover:text-green-700">
              Все заказы →
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">Нет заказов</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => {
                const StatusIcon = statusIcon[order.status?.code] ?? Clock;
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <StatusIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Заказ #{order.id}</p>
                        <p className="text-xs text-gray-500">{order.items.length} товаров • {order.createdAt?.split('T')[0] ?? ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{order.total_price} ₽</p>
                      <p className="text-xs text-gray-500">{order.status?.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/seller/shops')}
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <Store className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Управление магазинами</span>
            </button>
            <button
              onClick={() => router.push('/seller/products')}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Управление товарами</span>
            </button>
            <button
              onClick={() => router.push('/seller/orders')}
              className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-left"
            >
              <ShoppingCart className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Все заказы</span>
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
