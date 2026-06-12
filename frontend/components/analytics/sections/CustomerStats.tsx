'use client';

import { Users, UserPlus, Repeat } from 'lucide-react';
import StatGrid from '../widgets/StatGrid';
import BaseChart from '../charts/BaseChart';
import StatusPieChart from '../charts/StatusPieChart';
import type { CustomerStats } from '../../../services/analytics.service';

interface CustomerStatsProps {
  data: CustomerStats;
}

export default function CustomerStatsSection({ data }: CustomerStatsProps) {
  if (!data || data.total === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет данных о клиентах</p>
      </div>
    );
  }

  const pieData = [
    { code: 'new', label: 'Новые', count: data.new },
    { code: 'returning', label: 'Повторные', count: data.returning },
  ];

  const metrics = [
    { title: 'Всего клиентов', value: data.total, icon: Users },
    { title: 'Новые', value: data.new, icon: UserPlus },
    { title: 'Повторные', value: data.returning, icon: Repeat },
    { title: 'Доля новых', value: `${data.total > 0 ? Math.round((data.new / data.total) * 100) : 0}%`, icon: Users },
  ];

  return (
    <div className="space-y-4">
      <StatGrid metrics={metrics} />
      <BaseChart title="Клиенты">
        <StatusPieChart data={pieData} />
      </BaseChart>
    </div>
  );
}
