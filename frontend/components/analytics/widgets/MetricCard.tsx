import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon className="h-4 w-4 text-indigo-600" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('ru-RU') : value}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
