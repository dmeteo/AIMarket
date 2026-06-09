'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Store, Package, ShoppingCart, TrendingUp, Eye } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import StatCard from '../../../components/admin/StatCard';
import { useAuth } from '../../../hooks/useAuth';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/applications', label: 'Заявки', icon: <Package className="h-5 w-5" /> },
  { href: '/admin/sellers', label: 'Продавцы', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/shops', label: 'Магазины', icon: <Store className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Пользователи', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/analytics', label: 'Аналитика', icon: <TrendingUp className="h-5 w-5" /> },
];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isAdmin = false;
    if (token && userStr) {
      try { isAdmin = JSON.parse(userStr).role === 'ADMIN'; } catch { /* ignore */ }
    }
    if (!isAdmin) {
      console.log('[AdminAnalytics] Redirecting to /admin/login...');
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout navItems={adminNavItems} title="Аналитика">
      <div className="space-y-6">
        {/* Period filter */}
        <div className="flex gap-2">
          {['День', 'Неделя', 'Месяц', 'Год'].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                period === 'Неделя'
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Продажи" value="124 500 ₽" icon={TrendingUp} trend={{ value: '+18%', positive: true }} />
          <StatCard title="Заказы" value={47} icon={ShoppingCart} trend={{ value: '+12%', positive: true }} />
          <StatCard title="Новые пользователи" value={23} icon={Users} trend={{ value: '+8%', positive: true }} />
          <StatCard title="Конверсия" value="3.2%" icon={Eye} trend={{ value: '+0.5%', positive: true }} />
        </div>

        {/* Charts placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Продажи по дням</h3>
            <div className="h-48 flex items-end gap-2 px-4">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 px-4">
              <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ категорий</h3>
            <div className="space-y-3">
              {[
                { name: 'Электроника', percent: 45, color: 'bg-indigo-500' },
                { name: 'Аксессуары', percent: 25, color: 'bg-green-500' },
                { name: 'Периферия', percent: 15, color: 'bg-amber-500' },
                { name: 'Для дома', percent: 10, color: 'bg-red-500' },
                { name: 'Другое', percent: 5, color: 'bg-gray-400' },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">{cat.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top sellers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ продавцов</h3>
          <div className="space-y-3">
            {[
              { name: 'Петрова Мария', shop: 'GadgetPro', revenue: 89500, orders: 15 },
              { name: 'Иванов Иван', shop: 'TechStore', revenue: 45200, orders: 8 },
              { name: 'Сидоров Алексей', shop: 'ElectroShop', revenue: 12300, orders: 2 },
            ].map((seller, i) => (
              <div key={seller.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                  <p className="text-xs text-gray-500">{seller.shop}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{seller.revenue.toLocaleString()} ₽</p>
                  <p className="text-xs text-gray-500">{seller.orders} заказов</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
