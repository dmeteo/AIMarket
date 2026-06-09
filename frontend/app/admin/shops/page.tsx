'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Store, CheckCircle, XCircle, Eye, Package } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAuth } from '../../../hooks/useAuth';
import shopsData from '../../../mocks/data/seller-shops.json';
import applicationsData from '../../../mocks/data/seller-applications.json';
import type { SellerShop } from '../../../services/seller.service';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/applications', label: 'Заявки', icon: <CheckCircle className="h-5 w-5" /> },
  { href: '/admin/sellers', label: 'Продавцы', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/shops', label: 'Магазины', icon: <Store className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Пользователи', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/analytics', label: 'Аналитика', icon: <Package className="h-5 w-5" /> },
];

export default function AdminShopsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [shops] = useState<SellerShop[]>((shopsData as { shops: SellerShop[] }).shops);

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isAdmin = false;
    if (token && userStr) {
      try { isAdmin = JSON.parse(userStr).role === 'ADMIN'; } catch { /* ignore */ }
    }
    if (!isAdmin) {
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null;

  const getSellerName = (sellerId: number): string => {
    const app = (applicationsData as { applications: Array<{ userId: number; sellerData: { name: string } }> }).applications.find(
      (a) => a.userId === sellerId,
    );
    return app?.sellerData?.name || `ID: ${sellerId}`;
  };

  return (
    <AdminLayout navItems={adminNavItems} title="Магазины">
      <div className="space-y-4">
        <div className="flex gap-2">
          {['Все', 'Активные', 'Приостановленные'].map((tab) => (
            <button key={tab} className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Магазин</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Продавец</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Товары</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Заказы</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Выручка</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Store className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                        <p className="text-xs text-gray-400">#{shop.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getSellerName(shop.seller_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{shop.products_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{shop.orders_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{shop.revenue.toLocaleString()} ₽</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      shop.is_active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {shop.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {shop.is_active ? 'Активен' : 'Приостановлен'}
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
