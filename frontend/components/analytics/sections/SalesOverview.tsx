'use client';

import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import StatGrid from '../widgets/StatGrid';
import SalesChart from '../charts/SalesChart';
import type { AnalyticsSummary, SalesByDay } from '../../../services/analytics.service';

interface SalesOverviewProps {
  summary: AnalyticsSummary;
  salesByDay: SalesByDay[];
}

export default function SalesOverview({ summary, salesByDay }: SalesOverviewProps) {
  const metrics = [
    { title: 'Выручка', value: `${summary.total_revenue.toLocaleString('ru-RU')} ₽`, icon: DollarSign, trend: { value: '+12%', positive: true } },
    { title: 'Заказы', value: summary.total_orders, icon: ShoppingCart, trend: { value: '+8%', positive: true } },
    { title: 'Средний чек', value: `${Math.round(summary.avg_order_value).toLocaleString('ru-RU')} ₽`, icon: Package, trend: { value: '-3%', positive: false } },
    { title: 'Конверсия', value: '3.2%', icon: TrendingUp, trend: { value: '+0.5%', positive: true } },
  ];

  return (
    <div className="space-y-4">
      <StatGrid metrics={metrics} />
      <SalesChart data={salesByDay} />
    </div>
  );
}
