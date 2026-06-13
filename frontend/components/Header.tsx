'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, LogOut, User, Store, Package, Grid2X2, Sparkles, Heart } from 'lucide-react';
import Input from './ui/Input';
import { useProducts, type GetProductsResponse } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../store/cart.store';
import { useOrders } from '../hooks/useOrders';
import categoriesData from '../mocks/data/categories.json';
import type { Category } from '../services/category.service';
import OrderCard from './widgets/OrderCard';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const ordersTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories: Category[] = (categoriesData as { categories: Category[] }).categories;

  const { data } = useProducts(30);

  const allProducts = data?.pages?.flatMap((p: GetProductsResponse) => p.items) ?? [];
  const { data: ordersData } = useOrders(isAuthenticated);

  const activeOrders = (ordersData?.orders ?? []).filter(
    (order) => order.status?.code !== 'RECEIVED',
  );

  const filtered =
    searchTerm.length >= 2
      ? allProducts.filter(
          (p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.categories?.[0]?.title && p.categories?.[0]?.title.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : [];

  const handleAISearch = () => {
    setShowResults(false);
    setSearchTerm('');
    window.dispatchEvent(new CustomEvent('ai-search', { detail: { query: searchTerm } }));
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-700 bg-white ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h2 className="text-xl font-bold text-zinc-900">AI Market</h2>
          </Link>

          {/* Navigation + Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-8">
            <button
              onClick={() => setShowCatalog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-base font-semibold transition-colors flex-shrink-0"
            >
              <Grid2X2 className="h-5 w-5" />
              Каталог
            </button>

            {/* Search */}
            <div ref={searchRef} className="relative flex-1">
              <Input
                type="search"
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                variant="search"
                icon={<Search className="h-4 w-4" />}
              />
              {showResults && searchTerm.length >= 2 && (
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
                  {filtered.length > 0 ? (
                    filtered.slice(0, 5).map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        className="block px-3 py-2 hover:bg-gray-50 text-sm text-gray-900"
                        onClick={closeSearch}
                      >
                        {p.title}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2">
                      <p className="text-sm text-gray-500">Ничего не найдено</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Cart & Auth */}
          <div className="flex items-center space-x-4">
            {/* Icons with labels */}
            <div className="flex items-center gap-2">
              {/* Orders — only for authenticated users */}
              {isAuthenticated && (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (ordersTimeoutRef.current) clearTimeout(ordersTimeoutRef.current);
                    setShowOrders(true);
                  }}
                  onMouseLeave={() => {
                    ordersTimeoutRef.current = setTimeout(() => setShowOrders(false), 150);
                  }}
                >
                  <Link
                    href="/profile/orders"
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Package className="h-6 w-6 text-zinc-600 group-hover:text-zinc-900" />
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-700">Заказы</span>
                  </Link>

                  {showOrders && activeOrders.length > 0 && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[440px] animate-fade-in"
                      onMouseEnter={() => {
                        if (ordersTimeoutRef.current) clearTimeout(ordersTimeoutRef.current);
                      }}
                      onMouseLeave={() => {
                        ordersTimeoutRef.current = setTimeout(() => setShowOrders(false), 150);
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]" />
                      <div className="relative bg-white border border-gray-200 rounded-xl shadow-2xl p-3">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <h3 className="text-sm font-semibold text-gray-900">Активные заказы</h3>
                          <Link href="/profile/orders" className="text-xs text-indigo-600 hover:text-indigo-700" onClick={() => setShowOrders(false)}>
                            Все заказы →
                          </Link>
                        </div>
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                          {activeOrders.map((order) => (
                            <OrderCard key={order.id} order={order} variant="dropdown" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites — only for authenticated users */}
              {isAuthenticated && (
                <button
                  className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
                  onClick={() => console.log('Favorites')}
                >
                  <Heart className="h-6 w-6 text-zinc-600 group-hover:text-red-500" />
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-700">Избранное</span>
                </button>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <ShoppingCart className="h-6 w-6 text-zinc-600 group-hover:text-zinc-900" />
                <span className="text-xs text-zinc-500 group-hover:text-zinc-700">Корзина</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0 flex h-4 w-4 items-center justify-center bg-red-600 text-white rounded-full text-[9px] font-medium min-w-[16px]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <User className="h-6 w-6 text-zinc-600 group-hover:text-zinc-900" />
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-700 max-w-[48px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Профиль
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Заказы
                      </Link>
                      {user.role === 'SELLER' ? (
                        <Link
                          href="/seller/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Store className="h-4 w-4 mr-2" />
                          Личный кабинет продавца
                        </Link>
                      ) : null}
                      {user.role === 'ADMIN' ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Grid2X2 className="h-4 w-4 mr-2" />
                          Личный кабинет админа
                        </Link>
                      ) : null}
                      {user.role === 'BUYER' ? (
                        <Link
                          href="/profile/become-seller"
                          className="flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Store className="h-4 w-4 mr-2" />
                          Стать продавцом
                        </Link>
                      ) : null}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <User className="h-6 w-6 text-zinc-600 group-hover:text-zinc-900" />
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-700">Войти</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCatalog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[70vh] overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Категории</h2>
              <button
                onClick={() => setShowCatalog(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            {/* Categories grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(70vh-60px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/category/${cat.id}`}
                      onClick={() => setShowCatalog(false)}
                      className="block group"
                    >
                      <span className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {cat.title}
                      </span>
                    </Link>
                    {cat.subcategories && (
                      <div className="mt-1.5 space-y-1">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${sub.id}`}
                            onClick={() => setShowCatalog(false)}
                            className="block text-sm text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
