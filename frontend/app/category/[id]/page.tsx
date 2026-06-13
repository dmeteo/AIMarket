'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '../../../hooks/useProducts';
import { categoryService, type Category } from '../../../services/category.service';
import categoriesData from '../../../mocks/data/categories.json';
import shopsData from '../../../mocks/data/seller-shops.json';
import Header from '../../../components/Header';
import Breadcrumbs from '../../../components/search/Breadcrumbs';
import CategoryFilters from '../../../components/search/CategoryFilters';
import ProductCard from '../../../components/widgets/ProductCard';
import Skeleton from '../../../components/ui/Skeleton';
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
  title: string;       // основное поле из API
  name?: string;       // для обратной совместимости
  description: string;
  logo_url: string | null;
  seller_id: number;
  products_count: number;
  orders_count: number;
  revenue: number;
  is_active: boolean;
  created_at: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = Number(params.id);

  const [categories] = useState<Category[]>(
    (categoriesData as { categories: Category[] }).categories,
  );
  const [shops] = useState<ShopItem[]>(
    (shopsData as { shops: ShopItem[] }).shops,
  );

  const [selectedShopIds, setSelectedShopIds] = useState<number[]>([]);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data, isLoading } = useProducts(30);

  const currentCategory = useMemo(
    () => categoryService.findCategoryById(categories, categoryId),
    [categories, categoryId],
  );

  const breadcrumbs = useMemo(
    () => categoryService.getBreadcrumbs(categories, categoryId),
    [categories, categoryId],
  );

  const allProducts = useMemo(
    () => data?.pages?.flatMap((p) => p.items) ?? [],
    [data],
  );

  const filteredProducts = useMemo(() => {
    if (allProducts.length === 0) return [];

    const descendantIds = currentCategory
      ? categoryService.getDescendantIds(currentCategory)
      : [categoryId];

    let result = allProducts.filter((p) =>
      p.categories?.some((c) => descendantIds.includes(c.id)),
    );

    if (selectedShopIds.length > 0) {
      result = result.filter((p) =>
        p.shop_ids?.some((sid) => selectedShopIds.includes(sid)),
      );
    }

    if (priceFrom) {
      result = result.filter((p) => parseFloat(p.final_price) >= Number(priceFrom));
    }
    if (priceTo) {
      result = result.filter((p) => parseFloat(p.final_price) <= Number(priceTo));
    }

    // Apply sorting
    const sorted = [...result];
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
  }, [allProducts, categoryId, currentCategory, selectedShopIds, priceFrom, priceTo, sortBy]);

  const handleShopToggle = (shopId: number) => {
    setSelectedShopIds((prev) =>
      prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId],
    );
  };

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    if (!value) {
      setPriceFrom('');
      setPriceTo('');
      return;
    }
    const [min, max] = value.split('-');
    setPriceFrom(min || '');
    setPriceTo(max || '');
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Популярные';

  if (!currentCategory && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-gray-500">Категория не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex gap-6">
          <aside className="w-48 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <CategoryFilters
                categories={categories}
                currentId={categoryId}
                shops={shops}
                selectedShopIds={selectedShopIds}
                onShopToggle={handleShopToggle}
                priceFrom={priceFrom}
                priceTo={priceTo}
                onPriceFromChange={setPriceFrom}
                onPriceToChange={setPriceTo}
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Товары не найдены</p>
                <p className="text-sm text-gray-400 mt-2">
                  Попробуйте изменить параметры фильтрации
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
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
          </main>
        </div>
      </div>
    </div>
  );
}
