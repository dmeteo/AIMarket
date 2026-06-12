'use client';

import BaseChart from '../charts/BaseChart';
import StatusPieChart from '../charts/StatusPieChart';
import type { StatusDistribution } from '../../../services/analytics.service';

interface OrdersByStatusProps {
  data: StatusDistribution[];
}

export default function OrdersByStatus({ data }: OrdersByStatusProps) {
  return (
    <BaseChart title="Заказы по статусам">
      <StatusPieChart data={data} />
    </BaseChart>
  );
}
