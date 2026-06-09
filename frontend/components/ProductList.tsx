'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allItems: Product[] = data?.pages
    ? data.pages.flatMap((page: GetProductsResponse) => page.items)
    : [];

  const filteredItems = allItems.filter((item: Product) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  });

  // Deduplicate by id
  const uniqueItems = filteredItems.filter(
    (item, index, self) => self.findIndex((p) => p.id === item.id) === index
  );

  const handleAISearch = () => {
    setShowDropdown(false);
    // Dispatch custom event for AI search
    window.dispatchEvent(new CustomEvent('ai-search', { detail: { query: searchTerm } }));
  };

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
      {/* Search with dropdown */}
      <div ref={searchRef} className="mb-4 relative">
        <Input
          type="search"
          placeholder="Поиск товаров..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          variant="search"
          icon={<Search className="h-4 w-4" />}
        />

        {/* Dropdown */}
        {showDropdown && searchTerm.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
            {/* AI Search button — always first */}
            <button
              onClick={handleAISearch}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100"
            >
              <Sparkles className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <span className="text-sm font-medium text-indigo-600">✨ AI поиск</span>
              <span className="text-xs text-gray-400 ml-auto">умный подбор</span>
            </button>

            {/* Regular results */}
            {uniqueItems.slice(0, 5).map((item) => (
              <a
                key={item.id}
                href={`/product/${item.id}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.images?.[0] ?? '/placeholder.svg'}
                    alt={item.title}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{parseFloat(item.final_price).toFixed(0)} ₽</p>
                </div>
              </a>
            ))}

            {uniqueItems.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-500">Товары не найдены</p>
            )}
          </div>
        )}
      </div>

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
