'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Info, ExternalLink } from 'lucide-react';
import type { SellerShop } from '../services/seller.service';

interface ShopCardProps {
  shop: SellerShop;
}

function formatOrdersCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'К';
  }
  return String(count);
}

export default function ShopCard({ shop }: ShopCardProps) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);

  const colors = [
    'bg-indigo-100 text-indigo-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-cyan-100 text-cyan-600',
    'bg-violet-100 text-violet-600',
  ];
  const colorIndex = shop.name.charCodeAt(0) % colors.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Clickable area: avatar + name + "Перейти" */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => router.push(`/seller/${shop.id}`)}
      >
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[colorIndex]}`}>
          {shop.logo_url ? (
            <Image src={shop.logo_url} alt={shop.name} width={48} height={48} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-lg font-bold">{shop.name.charAt(0)}</span>
          )}
        </div>

        {/* Name + "Перейти" */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {shop.name}
          </p>
          <p className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors flex items-center gap-1 mt-0.5">
            <ExternalLink className="h-3 w-3" />
            Перейти
          </p>
        </div>

        {/* Rating badge */}
        <div className="flex-shrink-0 bg-gray-100 rounded-lg px-2.5 py-1.5 flex flex-col items-center">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-gray-700 mt-0.5">4.8</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">Заказы</span>
        <div className="bg-gray-100 rounded-lg px-2.5 py-1">
          <span className="text-sm font-semibold text-gray-700">{formatOrdersCount(shop.orders_count)}</span>
        </div>
      </div>

      {/* Divider + "О магазине" */}
      <div className="border-t border-gray-100 mt-3 pt-3">
        <div className="relative">
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">О магазине</span>
          </div>

          {showTooltip && shop.description && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
              <p className="text-xs text-gray-600 leading-relaxed">{shop.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
