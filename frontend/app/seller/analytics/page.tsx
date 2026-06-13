'use client';

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { analyticsService } from '../../../services/analytics.service';
import { useQuery } from '@tanstack/react-query';
import SellerLayout from '../../../components/seller/SellerLayout';
import SalesOverview from '../../../components/analytics/sections/SalesOverview';
import OrdersByStatus from '../../../components/analytics/sections/OrdersByStatus';
import TopProducts from '../../../components/analytics/sections/TopProducts';
import RevenueByShop from '../../../components/analytics/sections/RevenueByShop';
import CustomerStatsSection from '../../../components/analytics/sections/CustomerStats';
import MultiSelect from '../../../components/analytics/widgets/MultiSelect';
import Skeleton from '../../../components/ui/Skeleton';
import shopsData from '../../../mocks/data/seller-shops.json';

type AnalyticsTab = 'overview' | 'sales' | 'products' | 'customers';

const TABS: { value: AnalyticsTab; label: string }[] = [
  { value: 'overview', label: 'Обзор' },
  { value: 'sales', label: 'Продажи' },
  { value: 'products', label: 'Товары' },
  { value: 'customers', label: 'Клиенты' },
];

export default function SellerAnalyticsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [period, setPeriod] = useState('month');
  const [selectedShopIds, setSelectedShopIds] = useState<number[]>([]);

  const shopOptions = (shopsData as { shops: Array<{ id: number; title: string }> }).shops.map((s) => ({
    value: s.id,
    label: s.title,
  }));

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['seller-analytics', user?.id, period, selectedShopIds],
    queryFn: () => analyticsService.getSellerAnalytics(user!.id, { period, shop_ids: selectedShopIds }),
    enabled: !!user?.id,
  });

  return (
    <SellerLayout title="Аналитика">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {{ day: 'День', week: 'Неделя', month: 'Месяц', year: 'Год' }[p]}
            </button>
          ))}
        </div>
        <div className="w-48">
          <MultiSelect
            options={shopOptions}
            value={selectedShopIds}
            onChange={setSelectedShopIds}
            placeholder="Все магазины"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : analytics ? (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <SalesOverview summary={analytics.summary} salesByDay={analytics.sales_by_day} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <OrdersByStatus data={analytics.status_distribution} />
                <RevenueByShop data={analytics.revenue_by_shop} />
              </div>
            </div>
          )}
          {activeTab === 'sales' && (
            <SalesOverview summary={analytics.summary} salesByDay={analytics.sales_by_day} />
          )}
          {activeTab === 'products' && (
            <TopProducts data={analytics.top_products} />
          )}
          {activeTab === 'customers' && (
            <CustomerStatsSection data={analytics.customers} />
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">Не удалось загрузить данные аналитики</p>
        </div>
      )}
    </SellerLayout>
  );
}
