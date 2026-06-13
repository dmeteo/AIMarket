'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import type { Category } from '../../services/category.service';
import type { SellerShop } from '../../services/seller.service';

interface CategoryFiltersProps {
  categories: Category[];
  currentId: number;
  shops: SellerShop[];
  selectedShopIds: number[];
  onShopToggle: (shopId: number) => void;
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
}

const PRICE_RANGES = [
  { value: '', label: 'Неважно' },
  { value: '0-15000', label: 'до 15 000 ₽' },
  { value: '15000-30000', label: '15 000–30 000 ₽' },
  { value: '30000-60000', label: '30 000–60 000 ₽' },
  { value: '60000-', label: '60 000 ₽ и дороже' },
];

export default function CategoryFilters({
  categories,
  currentId,
  shops,
  selectedShopIds,
  onShopToggle,
  priceFrom,
  priceTo,
  onPriceFromChange,
  onPriceToChange,
  priceRange,
  onPriceRangeChange,
}: CategoryFiltersProps) {
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([currentId]));
  const [showShops, setShowShops] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderCategoryTree = (cats: Category[], depth = 0) => {
    return cats.map((cat) => {
      const isActive = cat.id === currentId;
      const hasChildren = cat.subcategories && cat.subcategories.length > 0;
      const isExpanded = expandedCats.has(cat.id);

      return (
        <div key={cat.id}>
          <div className="flex items-center">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(cat.id)}
                className="p-0.5 mr-1 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {!hasChildren && <span className="w-5" />}
            <Link
              href={`/category/${cat.id}`}
              className={`text-sm py-1 px-2 rounded transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {cat.title}
            </Link>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(cat.subcategories!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-5">
      {/* Category tree */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Категория</h3>
        <div className="space-y-0.5">
          {renderCategoryTree(categories)}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Цена</h3>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-0.5 block">От</label>
            <input
              type="number"
              value={priceFrom}
              onChange={(e) => onPriceFromChange(e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-0.5 block">До</label>
            <input
              type="number"
              value={priceTo}
              onChange={(e) => onPriceToChange(e.target.value)}
              placeholder="∞"
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
        </div>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="priceRange"
                value={range.value}
                checked={priceRange === range.value}
                onChange={(e) => onPriceRangeChange(e.target.value)}
                className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500"
              />
              <span className={`text-sm ${priceRange === range.value ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div>
        <button
          onClick={() => setShowShops(!showShops)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-2"
        >
          <span>Магазин</span>
          {showShops ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showShops && (
          <div className="space-y-1.5">
            {shops.map((shop) => (
              <label
                key={shop.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedShopIds.includes(shop.id)}
                  onChange={() => onShopToggle(shop.id)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Store className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {shop.title}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
