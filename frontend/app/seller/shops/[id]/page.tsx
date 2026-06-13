'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, Eye, Store } from 'lucide-react';
import SellerLayout from '../../../../components/seller/SellerLayout';
import ShopForm from '../../../../components/seller/ShopForm';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useAuth } from '../../../../hooks/useAuth';
import { sellerService } from '../../../../services/seller.service';
import type { SellerShop } from '../../../../services/seller.service';

interface ShopProduct {
  id: number;
  title: string;
  price: string;
  final_price: string;
  category: string | null;
  quantity: number;
  is_active: boolean;
  price_override: string | null;
  stock: number;
}

export default function ShopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const shopId = parseInt(params.id as string, 10);

  const loadData = async () => {
    try {
      const shops = await sellerService.getSellerShops(user!.id);
      const found = shops.find((s) => s.id === shopId);
      if (found) {
        setShop(found);
        // Load products for this shop from shop-products.json via API
        // For now, we'll use a simplified approach
        const { productService } = await import('../../../../services/product.service');
        const shopProds = await productService.getProductsByShop(shopId);
        setProducts(shopProds as unknown as ShopProduct[]);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleUpdate = async (data: { title: string; description: string; logo_url?: string }) => {
    if (!shop) return;
    await sellerService.updateShop(shop.id, data);
    setShowEdit(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!shop) return;
    await sellerService.deleteShop(shop.id);
    router.push('/seller/shops');
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) window.location.href = '/login';
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.id && shopId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, shopId]);

  if (isLoading || loading) {
    return (
      <SellerLayout title="Магазин">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </SellerLayout>
    );
  }

  if (!shop) {
    return (
      <SellerLayout title="Магазин не найден">
        <div className="text-center py-16">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Магазин не найден</p>
          <Button variant="secondary" onClick={() => router.push('/seller/shops')}>
            Вернуться к магазинам
          </Button>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title={shop.title}>
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push('/seller/shops')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Все магазины
        </button>

        {/* Shop header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{shop.title}</h1>
                {shop.description && <p className="text-sm text-green-100 mt-1">{shop.description}</p>}
                <p className="text-xs text-green-200 mt-2">
                  Создан: {new Date(shop.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="px-3 py-1.5 text-sm bg-white/20 hover:bg-red-400/50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{shop.products_count}</p>
              <p className="text-xs text-gray-500">Товаров</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{shop.orders_count}</p>
              <p className="text-xs text-gray-500">Заказов</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{shop.revenue.toLocaleString()} ₽</p>
              <p className="text-xs text-gray-500">Выручка</p>
            </div>
          </div>
        </div>

        {/* Products section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Товары магазина</h3>
            <Button variant="primary" onClick={() => router.push('/seller/products')}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">В этом магазине пока нет товаров</p>
              <Button variant="secondary" onClick={() => router.push('/seller/products')}>
                Добавить первый товар
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Товар</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Категория</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Цена</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Остаток</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">{product.title}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{product.category || '—'}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{product.final_price} ₽</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{product.quantity}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.is_active ? 'Активен' : 'Черновик'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Редактировать магазин">
        <ShopForm
          shop={{ id: shop.id, title: shop.title, description: shop.description, logo_url: shop.logo_url }}
          onSave={handleUpdate}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Удалить магазин?">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Магазин <strong>{shop.title}</strong> и все его товары будут удалены. Это действие нельзя отменить.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowDelete(false)}>
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
