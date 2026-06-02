'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import Input from './ui/Input';
import { useProducts, type GetProductsResponse } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data } = useProducts(30);

  const filtered =
    searchTerm.length >= 2 && data?.pages
      ? data.pages
          .flatMap((p: GetProductsResponse) => p.items)
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
          )
      : [];

  const showResults = searchTerm.length >= 1 && filtered.length > 0;

  const handleSelect = (text: string) => {
    setSearchTerm('');
    router.push(`/search?query=${encodeURIComponent(text)}`);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header
      className={`border-b border-zinc-200 dark:border-zinc-700 bg-white ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h2 className="text-xl font-bold text-zinc-900">AI Market</h2>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-zinc-700 hover:text-zinc-900 text-sm">
              Главная
            </Link>
            <Link href="/market" className="text-zinc-700 hover:text-zinc-900 text-sm">
              Каталог
            </Link>
            <Link href="/about" className="text-zinc-700 hover:text-zinc-900 text-sm">
              О нас
            </Link>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="search"
              icon={<Search className="h-4 w-4" />}
            />
            {showResults && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10 max-h-64 overflow-y-auto">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => handleSelect(p.name)}
                  >
                    {p.name}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="p-2 text-sm text-gray-500">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>

          {/* Cart & Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-zinc-700 hover:text-zinc-900" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center bg-zinc-900 text-white rounded-full text-xs">
                0
              </span>
            </Link>

            {/* Auth section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm text-zinc-700 hover:text-zinc-900"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
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
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
