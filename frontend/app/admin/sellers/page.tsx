'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Search, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminNavItems } from '../../../components/admin/admin-nav';
import { useAuth } from '../../../hooks/useAuth';

type SortField = 'name' | 'shop' | 'products' | 'orders' | 'revenue' | 'registeredAt';
type SortDir = 'asc' | 'desc';

const mockSellers = [
  { id: 1, name: 'Иванов Иван', shop: 'TechStore', email: 'ivanov@example.com', status: 'active', products: 12, orders: 8, revenue: 45200, registeredAt: '2026-05-15' },
  { id: 2, name: 'Петрова Мария', shop: 'GadgetPro', email: 'petrova@example.com', status: 'active', products: 24, orders: 15, revenue: 89500, registeredAt: '2026-04-20' },
  { id: 3, name: 'Сидоров Алексей', shop: 'ElectroShop', email: 'sidorov@example.com', status: 'blocked', products: 5, orders: 2, revenue: 12300, registeredAt: '2026-06-01' },
  { id: 4, name: 'Козлова Анна', shop: 'HomeGoods', email: 'kozlova@example.com', status: 'active', products: 18, orders: 11, revenue: 67800, registeredAt: '2026-03-10' },
  { id: 5, name: 'Морозов Дмитрий', shop: 'SportZone', email: 'morozov@example.com', status: 'active', products: 31, orders: 22, revenue: 124500, registeredAt: '2026-02-28' },
  { id: 6, name: 'Волкова Елена', shop: 'BookWorld', email: 'volkova@example.com', status: 'blocked', products: 8, orders: 3, revenue: 23400, registeredAt: '2026-05-05' },
  { id: 7, name: 'Новиков Сергей', shop: 'TechHub', email: 'novikov@example.com', status: 'active', products: 45, orders: 38, revenue: 256000, registeredAt: '2026-01-15' },
  { id: 8, name: 'Федорова Ольга', shop: 'FashionStore', email: 'fedorova@example.com', status: 'active', products: 67, orders: 52, revenue: 389000, registeredAt: '2026-04-01' },
];

export default function AdminSellersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isAdmin = false;
    if (token && userStr) {
      try { isAdmin = JSON.parse(userStr).role === 'ADMIN'; } catch { /* ignore */ }
    }
    if (!isAdmin) window.location.href = '/admin/login';
  }, [isAuthenticated, user, router, isLoading]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredSellers = useMemo(() => {
    let result = [...mockSellers];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.shop.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'shop': cmp = a.shop.localeCompare(b.shop); break;
        case 'products': cmp = a.products - b.products; break;
        case 'orders': cmp = a.orders - b.orders; break;
        case 'revenue': cmp = a.revenue - b.revenue; break;
        case 'registeredAt': cmp = a.registeredAt.localeCompare(b.registeredAt); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-indigo-600" /> : <ChevronDown className="h-3 w-3 text-indigo-600" />;
  };

  return (
    <AdminLayout navItems={adminNavItems} title="Продавцы">
      <div className="space-y-4">
        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Поиск по имени, магазину, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all' as const, label: 'Все' },
              { value: 'active' as const, label: 'Активные' },
              { value: 'blocked' as const, label: 'Заблокированные' },
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

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {[
                  { field: 'name' as SortField, label: 'Продавец' },
                  { field: 'shop' as SortField, label: 'Магазин' },
                  { field: 'products' as SortField, label: 'Товары' },
                  { field: 'orders' as SortField, label: 'Заказы' },
                  { field: 'revenue' as SortField, label: 'Выручка' },
                  { field: 'registeredAt' as SortField, label: 'Регистрация' },
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
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">Ничего не найдено</td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                      <p className="text-xs text-gray-500">{seller.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{seller.shop}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{seller.products}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{seller.orders}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{seller.revenue.toLocaleString()} ₽</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{seller.registeredAt}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        seller.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400">Показано {filteredSellers.length} из {mockSellers.length} продавцов</p>
      </div>
    </AdminLayout>
  );
}
