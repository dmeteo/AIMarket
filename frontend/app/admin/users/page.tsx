'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Search, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminNavItems } from '../../../components/admin/admin-nav';
import { useAuth } from '../../../hooks/useAuth';

type SortField = 'name' | 'role' | 'status' | 'registeredAt';
type SortDir = 'asc' | 'desc';

const mockUsers = [
  { id: 1, name: 'Иванов Иван', email: 'ivanov@example.com', role: 'SELLER', status: 'active', registeredAt: '2026-05-15' },
  { id: 2, name: 'Петрова Мария', email: 'petrova@example.com', role: 'SELLER', status: 'active', registeredAt: '2026-04-20' },
  { id: 3, name: 'Сидоров Алексей', email: 'sidorov@example.com', role: 'BUYER', status: 'blocked', registeredAt: '2026-06-01' },
  { id: 4, name: 'Козлова Анна', email: 'kozlova@example.com', role: 'BUYER', status: 'active', registeredAt: '2026-05-22' },
  { id: 5, name: 'Морозов Дмитрий', email: 'morozov@example.com', role: 'BUYER', status: 'active', registeredAt: '2026-06-05' },
  { id: 6, name: 'Волкова Елена', email: 'volkova@example.com', role: 'BUYER', status: 'active', registeredAt: '2026-03-18' },
  { id: 7, name: 'Новиков Сергей', email: 'novikov@example.com', role: 'SELLER', status: 'active', registeredAt: '2026-02-10' },
  { id: 8, name: 'Федорова Ольга', email: 'fedorova@example.com', role: 'BUYER', status: 'blocked', registeredAt: '2026-04-25' },
  { id: 9, name: 'Алексеев Павел', email: 'alekseev@example.com', role: 'BUYER', status: 'active', registeredAt: '2026-06-08' },
  { id: 10, name: 'Админ Админов', email: 'admin@aimarket.com', role: 'ADMIN', status: 'active', registeredAt: '2026-01-01' },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'BUYER' | 'SELLER' | 'ADMIN'>('all');
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
    if (!isAdmin) window.location.href = '/login';
  }, [isAuthenticated, user, router, isLoading]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...mockUsers];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((u) => u.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'role': cmp = a.role.localeCompare(b.role); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'registeredAt': cmp = a.registeredAt.localeCompare(b.registeredAt); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [search, roleFilter, statusFilter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-indigo-600" /> : <ChevronDown className="h-3 w-3 text-indigo-600" />;
  };

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout navItems={adminNavItems} title="Пользователи">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Поиск по имени, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all' as const, label: 'Все' },
              { value: 'BUYER' as const, label: 'Покупатели' },
              { value: 'SELLER' as const, label: 'Продавцы' },
              { value: 'ADMIN' as const, label: 'Админы' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  roleFilter === tab.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
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

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {[
                  { field: 'name' as SortField, label: 'Пользователь' },
                  { field: 'role' as SortField, label: 'Роль' },
                  { field: 'status' as SortField, label: 'Статус' },
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Ничего не найдено</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.role === 'SELLER' ? 'bg-green-100 text-green-700' :
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'SELLER' ? 'Продавец' : u.role === 'ADMIN' ? 'Админ' : 'Покупатель'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.registeredAt}</td>
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
        <p className="text-xs text-gray-400">Показано {filteredUsers.length} из {mockUsers.length} пользователей</p>
      </div>
    </AdminLayout>
  );
}
