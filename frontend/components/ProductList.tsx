'use client';

import React from 'react';
import { useProducts, type GetProductsResponse, type Product } from '../hooks/useProducts';
import ProductCard from './widgets/ProductCard';
import Skeleton from './ui/Skeleton';
import Spinner from './ui/Spinner';

const ProductList = () => {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    status,
    error,
  } = useProducts(10);

  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    }, { rootMargin: '400px' });
    const current = loadMoreRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allItems: Product[] = data?.pages
    ? data.pages.flatMap((page: GetProductsResponse) => page.items)
    : [];

  // Deduplicate by id, skip items without id
  const uniqueItems = allItems
    .filter((item): item is Product & { id: number } => item.id != null)
    .filter(
      (item, index, self) => self.findIndex((p) => p.id === item.id) === index
    );

  if (status === 'pending') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-48" />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center text-red-500 py-8">
        Не удалось загрузить товары: {error?.message}
      </div>
    );
  }

  return (
    <>
      {uniqueItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Товары не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueItems.map((product: Product) => (
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

      {hasNextPage && isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      )}
      <div ref={loadMoreRef} className="h-4" />
    </>
  );
};

export default ProductList;
