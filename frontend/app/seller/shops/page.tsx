'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Store, Package, ShoppingCart, Trash2, Eye, AlertTriangle } from 'lucide-react';
import SellerLayout from '../../../components/seller/SellerLayout';
import ShopForm from '../../../components/seller/ShopForm';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { sellerService } from '../../../services/seller.service';
import type { SellerShop } from '../../../services/seller.service';

const MAX_SHOPS = 10;

export default function SellerShopsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shops, setShops] = useState<SellerShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<SellerShop | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const loadShops = async () => {
    try {
      const data = await sellerService.getSellerShops(user!.id);
      setShops(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleCreate = async (data: { name: string; description: string; logo_url?: string }) => {
    await sellerService.createShop(data);
    setShowForm(false);
    loadShops();
  };

  const handleUpdate = async (data: { name: string; description: string; logo_url?: string }) => {
    if (!editingShop) return;
    await sellerService.updateShop(editingShop.id, data);
    setEditingShop(undefined);
    setShowForm(false);
    loadShops();
  };

  const handleDelete = async () => {
    if (deleteConfirm === null) return;
    try {
      await sellerService.deleteShop(deleteConfirm);
      setDeleteConfirm(null);
      loadShops();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadShops();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const openCreate = () => {
    setEditingShop(undefined);
    setShowForm(true);
  };

  const openEdit = (shop: SellerShop) => {
    setEditingShop(shop);
    setShowForm(true);
  };

  if (isLoading || loading) {
    return (
      <SellerLayout title="Магазины">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title="Магазины">
      <div className="space-y-6">
        {/* Empty state */}
        {shops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">У вас пока нет магазинов</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Создайте свой первый магазин, чтобы начать продавать товары. Вы можете создать до {MAX_SHOPS} магазинов.
            </p>
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый магазин
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {shop.is_active ? (
                        <span className="text-green-600">● Активен</span>
                      ) : (
                        <span className="text-gray-400">● Приостановлен</span>
                      )}
                    </p>
                  </div>
                </div>

                {shop.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{shop.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    <span>{shop.products_count} товаров</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>{shop.orders_count} заказов</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/seller/shops/${shop.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Открыть
                  </button>
                  <button
                    onClick={() => openEdit(shop)}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(shop.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add shop card */}
            {shops.length < MAX_SHOPS && (
              <button
                onClick={openCreate}
                className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50/50 transition-colors min-h-[200px]"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Создать магазин</span>
                <span className="text-xs">Осталось {MAX_SHOPS - shops.length}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingShop(undefined); }}
        title={editingShop ? 'Редактировать магазин' : 'Создать магазин'}
      >
        <ShopForm
          shop={editingShop}
          onSave={editingShop ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingShop(undefined); }}
          maxShops={MAX_SHOPS}
          currentCount={shops.length}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Удалить магазин?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Все товары магазина будут удалены из каталога.</p>
              <p className="mt-1 text-amber-600">Это действие нельзя отменить.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Отмена
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </SellerLayout>
  );
}
