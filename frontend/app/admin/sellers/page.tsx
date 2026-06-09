'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Store, CheckCircle, XCircle, Eye } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAuth } from '../../../hooks/useAuth';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/applications', label: 'Заявки', icon: <CheckCircle className="h-5 w-5" /> },
  { href: '/admin/sellers', label: 'Продавцы', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/shops', label: 'Магазины', icon: <Store className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Пользователи', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/analytics', label: 'Аналитика', icon: <CheckCircle className="h-5 w-5" /> },
];

const mockSellers = [
  { id: 1, name: 'Иванов Иван', shop: 'TechStore', email: 'ivanov@example.com', status: 'active', products: 12, orders: 8, revenue: 45200, registeredAt: '2026-05-15' },
  { id: 2, name: 'Петрова Мария', shop: 'GadgetPro', email: 'petrova@example.com', status: 'active', products: 24, orders: 15, revenue: 89500, registeredAt: '2026-04-20' },
  { id: 3, name: 'Сидоров Алексей', shop: 'ElectroShop', email: 'sidorov@example.com', status: 'blocked', products: 5, orders: 2, revenue: 12300, registeredAt: '2026-06-01' },
];

export default function AdminSellersPage() {
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
      console.log('[AdminSellers] Redirecting to /admin/login...');
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout navItems={adminNavItems} title="Продавцы">
      <div className="space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {['Все', 'Активные', 'Заблокированные'].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sellers table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Продавец</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Магазин</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Товары</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Заказы</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Выручка</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockSellers.map((seller) => (
                <tr key={seller.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                    <p className="text-xs text-gray-500">{seller.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{seller.shop}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{seller.products}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{seller.orders}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{seller.revenue.toLocaleString()} ₽</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      seller.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {seller.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {seller.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
