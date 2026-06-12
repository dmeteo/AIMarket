'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BaseChart from '../charts/BaseChart';
import type { RevenueByShop } from '../../../services/analytics.service';

interface RevenueByShopProps {
  data: RevenueByShop[];
}

export default function RevenueByShop({ data }: RevenueByShopProps) {
  return (
    <BaseChart title="Выручка по магазинам">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="shop_name" tick={{ fontSize: 11, fill: '#374151' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BaseChart>
  );
}
