'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, XCircle, Eye } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAuth } from '../../../hooks/useAuth';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/applications', label: 'Заявки', icon: <CheckCircle className="h-5 w-5" /> },
  { href: '/admin/sellers', label: 'Продавцы', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/shops', label: 'Магазины', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Пользователи', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/analytics', label: 'Аналитика', icon: <CheckCircle className="h-5 w-5" /> },
];

const mockUsers = [
  { id: 1, name: 'Иванов Иван', email: 'ivanov@example.com', role: 'SELLER', status: 'active', registeredAt: '2026-05-15' },
  { id: 2, name: 'Петрова Мария', email: 'petrova@example.com', role: 'SELLER', status: 'active', registeredAt: '2026-04-20' },
  { id: 3, name: 'Сидоров Алексей', email: 'sidorov@example.com', role: 'BUYER', status: 'blocked', registeredAt: '2026-06-01' },
  { id: 4, name: 'Козлова Анна', email: 'kozlova@example.com', role: 'BUYER', status: 'active', registeredAt: '2026-05-22' },
  { id: 5, name: 'Морозов Дмитрий', email: 'morozov@example.com', role: 'BUYER', status: 'active', registeredAt: '2026-06-05' },
];

export default function AdminUsersPage() {
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
      console.log('[AdminUsers] Redirecting to /admin/login...');
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout navItems={adminNavItems} title="Пользователи">
      <div className="space-y-4">
        <div className="flex gap-2">
          {['Все', 'Покупатели', 'Продавцы', 'Заблокированные'].map((tab) => (
            <button key={tab} className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Роль</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Регистрация</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
