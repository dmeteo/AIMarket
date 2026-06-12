'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BaseChart from './BaseChart';

interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  const formattedData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
  }));

  return (
    <BaseChart
      title="Продажи"
      tabs={[
        { value: 'revenue', label: 'Выручка' },
        { value: 'orders', label: 'Заказы' },
      ]}
      activeTab={metric}
      onTabChange={(v) => setMetric(v as 'revenue' | 'orders')}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(v) => metric === 'revenue' ? `${(v / 1000).toFixed(0)}K` : String(v)}
            />
            <Tooltip
              formatter={(value) =>
                metric === 'revenue' ? [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка'] : [String(value), 'Заказы']
              }
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorMetric)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BaseChart>
  );
}
