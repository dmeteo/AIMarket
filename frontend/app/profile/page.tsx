'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, Settings, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render while loading or redirecting
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded-lg" />
              <div className="h-48 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Profile header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{user.name}</h1>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>

              {/* Role badge */}
              <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-full flex-shrink-0">
                {user.role === 'BUYER' ? 'Покупатель' : user.role === 'SELLER' ? 'Продавец' : user.role}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Link
              href="/profile/orders"
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Мои заказы</p>
                <p className="text-xs text-gray-500">История и статусы</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>

            <button
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Избранное</p>
                <p className="text-xs text-gray-500">Сохранённые товары</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <Link
              href="/profile/settings"
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Настройки</p>
                <p className="text-xs text-gray-500">Пароль, уведомления</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>
          </div>

          {/* Become a seller CTA */}
          {user.role === 'BUYER' && (
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white mb-1">Стать продавцом</h2>
                  <p className="text-sm text-zinc-300 mb-4">
                    Создайте свой магазин и начните продавать товары на нашей платформе
                  </p>
                  <button
                    className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Начать продавать
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
