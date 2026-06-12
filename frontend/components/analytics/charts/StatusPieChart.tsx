'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusData {
  code: string;
  label: string;
  count: number;
}

interface StatusPieChartProps {
  data: StatusData[];
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
            nameKey="label"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [String(value), String(name)]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
