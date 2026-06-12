import MetricCard from './MetricCard';
import type { LucideIcon } from 'lucide-react';

interface Metric {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
}

interface StatGridProps {
  metrics: Metric[];
}

export default function StatGrid({ metrics }: StatGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <MetricCard key={i} {...metric} />
      ))}
    </div>
  );
}
