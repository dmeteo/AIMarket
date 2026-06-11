'use client';

import { useRef, useState, useEffect, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Package } from 'lucide-react';
import Badge from '../ui/Badge';
import type { Order, OrderStatusCode } from '../../services/order.service';

const statusVariant: Record<OrderStatusCode, 'primary' | 'success' | 'warning' | 'destructive' | 'muted'> = {
  IN_PROCESSING: 'muted',
  CONFIRMED: 'primary',
  AWAITING_DELIVERY: 'warning',
  DELIVERY: 'warning',
  AWAIT_RECEIPT: 'warning',
  RECEIVED: 'success',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function ScrollingText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [offset, setOffset] = useState(0);
  const id = useId();

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;
    const overflow = textEl.scrollWidth > container.clientWidth;
    setIsOverflow(overflow);
    if (overflow) {
      setOffset(textEl.scrollWidth - container.clientWidth);
    }
  }, [text]);

  useEffect(() => {
    if (!isOverflow || offset === 0) return;
    const styleId = `marquee-style-${id}`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      @keyframes marquee-pingpong-${id} {
        0%   { transform: translateX(0); }
        25%  { transform: translateX(0); }
        50%  { transform: translateX(-${offset}px); }
        75%  { transform: translateX(-${offset}px); }
        100% { transform: translateX(0); }
      }
    `;
    return () => {
      styleEl?.remove();
    };
  }, [isOverflow, offset, id]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className ?? ''}`}>
      <span
        ref={textRef}
        className="inline-block whitespace-nowrap"
        style={
          isOverflow
            ? { animation: `marquee-pingpong-${id} 8s ease-in-out infinite` }
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  variant?: 'horizontal' | 'dropdown';
}

export default function OrderCard({ order, variant = 'horizontal' }: OrderCardProps) {
  const statusCode = (order.status?.code ?? 'IN_PROCESSING') as OrderStatusCode;
  const statusLabel = order.status?.label ?? 'Обработка';
  const firstItem = order.items[0];
  const image = firstItem?.product?.images?.[0] ?? '/placeholder.svg';
  const title = firstItem?.product?.title ?? 'Заказ';

  // Dropdown variant — compact horizontal card
  if (variant === 'dropdown') {
    return (
      <Link
        href={`/profile/orders/${order.id}`}
        className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
      >
        {/* Image */}
        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={80}
            height={80}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-sm font-bold text-gray-900">{statusLabel}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{order.address}</p>
          {order.predicted_date && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Ожид. {formatDate(order.predicted_date)}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Horizontal (default) — for main page widget
  return (
    <Link
      href={`/profile/orders/${order.id}`}
      className="flex-shrink-0 w-80 bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all group flex"
    >
      <div className="relative w-24 h-full flex-shrink-0 bg-gray-100 overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={96}
          height={96}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{title}</p>
          <Badge variant={statusVariant[statusCode]} className="mb-2">
            {statusLabel}
          </Badge>
          {order.predicted_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>Ожид. {formatDate(order.predicted_date)}</span>
            </div>
          )}
          <div className="flex items-start gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <ScrollingText text={order.address} className="flex-1 min-w-0" />
          </div>
        </div>
        {order.items.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
            <Package className="h-3 w-3 flex-shrink-0" />
            <span>ещё {order.items.length - 1} товар(ов)</span>
          </div>
        )}
      </div>
    </Link>
  );
}
