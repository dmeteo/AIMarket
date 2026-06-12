'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Store, Package, ShoppingCart } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminNavItems } from '../../../components/admin/admin-nav';
import StatCard from '../../../components/admin/StatCard';
import { useAuth } from '../../../hooks/useAuth';

const mockRecentApplications = [
  { id: 1, name: 'Иванов Иван', shop: 'TechStore', date: '2026-06-07' },
];

const mockRecentOrders = [
  { id: 1001, items: 2, total: 5380, status: 'IN_PROCESSING' },
  { id: 1002, items: 1, total: 4310, status: 'CONFIRMED' },
  { id: 1003, items: 3, total: 8920, status: 'DELIVERY' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log(`[AdminDashboard] isLoading=${isLoading} isAuthenticated=${isAuthenticated} role=${user?.role}`);
    // Wait until auth state is fully loaded
    if (isLoading) return;

    // Double-check localStorage to prevent false redirect
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isAdmin = false;
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        isAdmin = userData.role === 'ADMIN';
      } catch { /* ignore */ }
    }

    if (!isAdmin) {
      console.log('[AdminDashboard] Redirecting to /admin/login...');
      window.location.href = '/admin/login';
    } else {
      console.log('[AdminDashboard] Admin confirmed, staying on dashboard');
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout navItems={adminNavItems} title="Дашборд">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Пользователи" value={12} icon={Users} trend={{ value: '+3 за неделю', positive: true }} />
          <StatCard title="Продавцы" value={3} icon={Store} />
          <StatCard title="Товары" value={40} icon={Package} trend={{ value: '+5 новых', positive: true }} />
          <StatCard title="Заказы" value={mockRecentOrders.length} icon={ShoppingCart} trend={{ value: '+2 сегодня', positive: true }} />
        </div>

        {/* Quick link to analytics */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Подробная аналитика</h3>
              <p className="text-sm text-indigo-100">Графики продаж, топ товаров, статистика по магазинам</p>
            </div>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Открыть →
            </button>
          </div>
        </div>

        {/* Recent applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Последние заявки</h3>
            <button
              onClick={() => router.push('/admin/applications')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Все заявки →
            </button>
          </div>
          {mockRecentApplications.length === 0 ? (
            <p className="text-sm text-gray-500">Нет новых заявок</p>
          ) : (
            <div className="space-y-3">
              {mockRecentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.name}</p>
                    <p className="text-xs text-gray-500">{app.shop} • {app.date}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    На проверке
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние заказы</h3>
          {mockRecentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Нет заказов</p>
          ) : (
            <div className="space-y-3">
              {mockRecentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Заказ #{order.id}</p>
                    <p className="text-xs text-gray-500">{order.items} товаров • {order.total} ₽</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                    order.status === 'DELIVERY' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'IN_PROCESSING' ? 'Новый' :
                     order.status === 'CONFIRMED' ? 'Подтверждён' :
                     order.status === 'DELIVERY' ? 'В доставке' : 'Получен'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
