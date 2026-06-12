'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminNavItems } from '../../../components/admin/admin-nav';
import { useAuth } from '../../../hooks/useAuth';

const salesData = [
  { date: 'Пн', revenue: 12400, orders: 8 },
  { date: 'Вт', revenue: 18200, orders: 12 },
  { date: 'Ср', revenue: 15800, orders: 10 },
  { date: 'Чт', revenue: 22100, orders: 15 },
  { date: 'Пт', revenue: 28500, orders: 18 },
  { date: 'Сб', revenue: 35200, orders: 22 },
  { date: 'Вс', revenue: 19800, orders: 13 },
];

const categoryData = [
  { name: 'Электроника', value: 45, color: '#6366f1' },
  { name: 'Аксессуары', value: 25, color: '#22c55e' },
  { name: 'Периферия', value: 15, color: '#f59e0b' },
  { name: 'Для дома', value: 10, color: '#ef4444' },
  { name: 'Другое', value: 5, color: '#9ca3af' },
];

const revenueByShopData = [
  { name: 'TechPro', revenue: 254090, fill: '#6366f1' },
  { name: 'AudioHub', revenue: 89400, fill: '#22c55e' },
  { name: 'GadgetZone', revenue: 124600, fill: '#f59e0b' },
];

const topSellersData = [
  { name: 'Петрова Мария', shop: 'GadgetPro', revenue: 89500, orders: 15 },
  { name: 'Иванов Иван', shop: 'TechStore', revenue: 45200, orders: 8 },
  { name: 'Сидоров Алексей', shop: 'ElectroShop', revenue: 12300, orders: 2 },
];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [period, setPeriod] = useState('week');

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

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout navItems={adminNavItems} title="Аналитика">
      <div className="space-y-6">
        {/* Period filter */}
        <div className="flex gap-2">
          {[
            { value: 'day', label: 'День' },
            { value: 'week', label: 'Неделя' },
            { value: 'month', label: 'Месяц' },
            { value: 'year', label: 'Год' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                period === p.value
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Выручка', value: '124 500 ₽', icon: DollarSign, trend: '+18%', positive: true },
            { title: 'Заказы', value: 47, icon: ShoppingCart, trend: '+12%', positive: true },
            { title: 'Новые пользователи', value: 23, icon: Users, trend: '+8%', positive: true },
            { title: 'Конверсия', value: '3.2%', icon: TrendingUp, trend: '+0.5%', positive: true },
          ].map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{stat.title}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Продажи по дням</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category pie chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Продажи по категориям</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Доля']} />
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-gray-900">
                    100%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-600">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by shop */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Выручка по магазинам</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByShopData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка']} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={40}>
                    {revenueByShopData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top sellers */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Топ продавцов</h3>
            <div className="space-y-3">
              {topSellersData.map((seller, i) => (
                <div key={seller.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                    <p className="text-xs text-gray-500">{seller.shop} · {seller.orders} заказов</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{seller.revenue.toLocaleString()} ₽</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
