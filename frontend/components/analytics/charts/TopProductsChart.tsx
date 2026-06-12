'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopProduct {
  id: number;
  title: string;
  sales: number;
  revenue: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.slice(0, 7).map((p) => ({
    title: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
    sales: p.sales,
    revenue: p.revenue,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={120}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString('ru-RU'), 'Продажи']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
