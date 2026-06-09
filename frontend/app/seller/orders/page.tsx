'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Truck, Package } from 'lucide-react';
import SellerLayout from '../../../components/seller/SellerLayout';
import { useAuth } from '../../../hooks/useAuth';
import { sellerService } from '../../../services/seller.service';
import type { SellerOrder } from '../../../services/seller.service';

export default function SellerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      sellerService.getSellerOrders(user.id).then(setOrders).catch(() => {});
    }
  }, [isAuthenticated, user]);

  if (isLoading || !isAuthenticated) return null;

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status?.code === statusFilter);

  const statusIcon: Record<string, typeof Clock> = {
    IN_PROCESSING: Clock,
    CONFIRMED: CheckCircle,
    DELIVERY: Truck,
    RECEIVED: CheckCircle,
  };

  return (
    <SellerLayout title="Заказы">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Все' },
            { value: 'IN_PROCESSING', label: 'Новые' },
            { value: 'CONFIRMED', label: 'Подтверждённые' },
            { value: 'DELIVERY', label: 'В доставке' },
            { value: 'RECEIVED', label: 'Полученные' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                statusFilter === tab.value
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Нет заказов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const StatusIcon = statusIcon[order.status?.code] ?? Clock;
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <StatusIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Заказ #{order.id}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{order.createdAt?.split('T')[0] ?? ''}</p>
                        <div className="flex gap-2 mt-1">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-xs text-gray-400">
                              {item.product.title} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-gray-900">{order.total_price} ₽</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.status?.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
