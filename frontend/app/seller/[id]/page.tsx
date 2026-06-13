'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../../components/Header';
import ProductCard from '../../../components/widgets/ProductCard';
import Skeleton from '../../../components/ui/Skeleton';
import { Share2, Info, Star, Package } from 'lucide-react';
import shopsData from '../../../mocks/data/seller-shops.json';
import { useProducts } from '../../../hooks/useProducts';
import { ChevronDown } from 'lucide-react';

type SortOption = 'popular' | 'new' | 'cheap' | 'expensive' | 'rating' | 'discount';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Популярные' },
  { value: 'new', label: 'Новинки' },
  { value: 'cheap', label: 'Дешевле' },
  { value: 'expensive', label: 'Дороже' },
  { value: 'rating', label: 'С высоким рейтингом' },
  { value: 'discount', label: 'С большими скидками' },
];

interface ShopItem {
  id: number;
  seller_id: number;
  title: string;       // было name → title
  description: string;
  logo_url: string | null;
  products_count: number;
  orders_count: number;
  reviews_count: number;
  revenue: number;
  is_active: boolean;
  created_at: string;
}

export default function SellerPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = Number(params.id);

  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const { data, isLoading } = useProducts(30);

  const shop = useMemo(
    () => (shopsData as { shops: ShopItem[] }).shops.find((s) => s.id === shopId) ?? null,
    [shopId],
  );

  const allProducts = useMemo(
    () => data?.pages?.flatMap((p) => p.items) ?? [],
    [data],
  );

  // Filter products by shop_id
  const shopProducts = useMemo(() => {
    if (!shop) return [];
    return allProducts.filter((p) => p.shop_id === shop.id);
  }, [allProducts, shop]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    if (shopProducts.length === 0) return [];
    const sorted = [...shopProducts];
    switch (sortBy) {
      case 'new':
        sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'cheap':
        sorted.sort((a, b) => parseFloat(a.final_price) - parseFloat(b.final_price));
        break;
      case 'expensive':
        sorted.sort((a, b) => parseFloat(b.final_price) - parseFloat(a.final_price));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'discount':
        sorted.sort((a, b) => parseFloat(b.discount_percent ?? '0') - parseFloat(a.discount_percent ?? '0'));
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
        break;
    }
    return sorted;
  }, [shopProducts, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Популярные';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const colors = [
    'bg-indigo-100 text-indigo-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-cyan-100 text-cyan-600',
    'bg-violet-100 text-violet-600',
  ];
  const colorIndex = shop ? shop.title.charCodeAt(0) % colors.length : 0;

  if (!shop && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Магазин не найден</h1>
            <button
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Вернуться на главную
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Shop card */}
          {shop && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[colorIndex]}`}>
                  {shop.logo_url ? (
                    <Image src={shop.logo_url} alt={shop.title} width={64} height={64} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl font-bold">{shop.title.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900">{shop.title}</h1>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">4.8</span>
                    </div>
                    <span className="text-sm text-gray-500">{shop.reviews_count ?? 0} отзывов</span>
                  </div>

                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{shop.products_count} товаров</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{shop.orders_count} заказов</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Поделиться"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Информация"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sort + Products */}
          <div className="flex gap-6">
            {/* Left sidebar placeholder for future filters */}
            <aside className="w-48 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Фильтры</h3>
                <p className="text-xs text-gray-400">Скоро будут доступны</p>
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1 min-w-0">
              {/* Sort dropdown */}
              <div className="relative mb-4">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {currentSortLabel}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-72" />
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">Товары не найдены</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      description={product.description}
                      price={product.price}
                      final_price={product.final_price}
                      images={product.images}
                      rating={product.rating ?? 0}
                      isNew={product.isNew}
                      isBestSeller={product.isBestSeller}
                      discountPercent={product.discount_percent}
                      reviewsCount={product.reviews_count ?? 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Share toast */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm animate-fade-in">
          Ссылка скопирована!
        </div>
      )}

      {/* Info modal */}
      {showInfoModal && shop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowInfoModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[colorIndex]}`}>
                <span className="text-xl font-bold">{shop.title.charAt(0)}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{shop.title}</h2>
            </div>

            {shop.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{shop.description}</p>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{shop.products_count}</p>
                <p className="text-xs text-gray-500">Товаров</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{shop.orders_count}</p>
                <p className="text-xs text-gray-500">Заказов</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">4.8</p>
                <p className="text-xs text-gray-500">Рейтинг</p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
