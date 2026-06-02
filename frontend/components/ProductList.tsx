'use client';

import React, { useState } from 'react';
import { useProducts, type GetProductsResponse, type Product } from '../hooks/useProducts';
import ProductCard from './widgets/ProductCard';
import Skeleton from './ui/Skeleton';
import Spinner from './ui/Spinner';
import Input from './ui/Input';
import { Search } from 'lucide-react';

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
    }, { rootMargin: '200px' });
    const current = loadMoreRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [searchTerm, setSearchTerm] = useState('');

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
    return <div className="text-center text-red-500 py-8">Failed to load products: {error?.message}</div>;
  }

  const allItems: Product[] = data?.pages
    ? data.pages.flatMap((page: GetProductsResponse) => page.items)
    : [];

  const filteredItems = allItems.filter((item: Product) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
  });

  return (
    <>
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Поиск товаров..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="search"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((product: Product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            imageUrl={product.imageUrl}
            rating={product.rating}
            isNew={product.isNew}
            isBestSeller={product.isBestSeller}
            discountPercentage={product.discountPercentage}
          />
        ))}
      </div>

      {hasNextPage && isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Spinner size="md" className="h-5 w-5" />
        </div>
      )}
      <div ref={loadMoreRef} />
    </>
  );
};

export default ProductList;
