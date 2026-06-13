'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Store, CheckCircle, XCircle, Eye, Search, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminNavItems } from '../../../components/admin/admin-nav';
import { useAuth } from '../../../hooks/useAuth';
import shopsData from '../../../mocks/data/seller-shops.json';
import applicationsData from '../../../mocks/data/seller-applications.json';
import type { SellerShop } from '../../../services/seller.service';

type SortField = 'title' | 'seller' | 'products_count' | 'orders_count' | 'revenue';
type SortDir = 'asc' | 'desc';

export default function AdminShopsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [shops] = useState<SellerShop[]>((shopsData as { shops: SellerShop[] }).shops);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isAdmin = false;
    if (token && userStr) {
      try { isAdmin = JSON.parse(userStr).role === 'ADMIN'; } catch { /* ignore */ }
    }
    if (!isAdmin) window.location.href = '/login';
  }, [isAuthenticated, user, router, isLoading]);

  const getSellerName = (sellerId: number): string => {
    const app = (applicationsData as { applications: Array<{ userId: number; sellerData: { name: string } }> }).applications.find(
      (a) => a.userId === sellerId,
    );
    return app?.sellerData?.name || `ID: ${sellerId}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredShops = useMemo(() => {
    let result = [...shops];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => statusFilter === 'active' ? s.is_active : !s.is_active);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'seller': cmp = getSellerName(a.seller_id).localeCompare(getSellerName(b.seller_id)); break;
        case 'products_count': cmp = a.products_count - b.products_count; break;
        case 'orders_count': cmp = a.orders_count - b.orders_count; break;
        case 'revenue': cmp = a.revenue - b.revenue; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, sortField, sortDir, shops]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-indigo-600" /> : <ChevronDown className="h-3 w-3 text-indigo-600" />;
  };

  return (
    <AdminLayout navItems={adminNavItems} title="Магазины">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Поиск по названию, описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all' as const, label: 'Все' },
              { value: 'active' as const, label: 'Активные' },
              { value: 'suspended' as const, label: 'Приостановленные' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === tab.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {[
                  { field: 'name' as SortField, label: 'Магазин' },
                  { field: 'seller' as SortField, label: 'Продавец' },
                  { field: 'products_count' as SortField, label: 'Товары' },
                  { field: 'orders_count' as SortField, label: 'Заказы' },
                  { field: 'revenue' as SortField, label: 'Выручка' },
                ].map((col) => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.field} />
                    </div>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Ничего не найдено</td></tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <Store className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{shop.title}</p>
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400">Показано {filteredShops.length} из {shops.length} магазинов</p>
      </div>
    </AdminLayout>
  );
}
