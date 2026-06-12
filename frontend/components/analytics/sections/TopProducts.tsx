'use client';

import BaseChart from '../charts/BaseChart';
import TopProductsChart from '../charts/TopProductsChart';
import type { TopProduct } from '../../../services/analytics.service';

interface TopProductsProps {
  data: TopProduct[];
}

export default function TopProducts({ data }: TopProductsProps) {
  return (
    <BaseChart title="Топ товаров">
      <TopProductsChart data={data} />
    </BaseChart>
  );
}
