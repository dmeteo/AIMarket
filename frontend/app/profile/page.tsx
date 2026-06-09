'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import Header from '../../components/Header';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { sellerService } from '../../services/seller.service';
import type { SellerApplication } from '../../services/seller.service';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    // Check localStorage directly to prevent false redirect before Zustand restores
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[Profile] No token, redirecting to /login');
      window.location.href = '/login';
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'BUYER' && user?.id) {
      // Try API first
      sellerService.getMyApplication(user.id)
        .then((app) => {
          if (app) {
            setApplication(app);
          } else {
            // Fallback: check localStorage
            const saved = localStorage.getItem(`seller_app_${user.id}`);
            if (saved) {
              try { setApplication(JSON.parse(saved)); } catch { /* ignore */ }
            }
          }
        })
        .catch(() => {
          // Fallback: check localStorage
          const saved = localStorage.getItem(`seller_app_${user.id}`);
          if (saved) {
            try { setApplication(JSON.parse(saved)); } catch { /* ignore */ }
          }
        });
    }
  }, [isAuthenticated, user]);

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

  const renderSellerBanner = () => {
    // SELLER role — show link to seller dashboard
    if (user.role === 'SELLER') {
      return (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">Вы — продавец!</h2>
              <p className="text-sm text-green-100 mb-4">
                Управляйте своим магазином и товарами
              </p>
              <Link href="/seller/dashboard">
                <Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50 flex items-center">
                  Личный кабинет продавца
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Has application — show status
    if (application) {
      if (application.status === 'PENDING') {
        return (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">Заявка на проверке</h2>
                <p className="text-sm text-amber-100">
                  Ваша заявка на регистрацию продавца рассматривается администратором. Ожидайте решения.
                </p>
              </div>
            </div>
          </div>
        );
      }

      if (application.status === 'REJECTED') {
        return (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">Заявка отклонена</h2>
                <p className="text-sm text-red-100 mb-4">
                  К сожалению, ваша заявка была отклонена администратором.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="bg-white text-red-700 hover:bg-red-50"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Подробнее
                  </Button>
                  <Link href="/profile/become-seller">
                    <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                      Внести изменения
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (application.status === 'APPROVED') {
        return (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">Заявка одобрена!</h2>
                <p className="text-sm text-green-100 mb-4">
                  Поздравляем! Теперь вы можете управлять своим магазином.
                </p>
                <Link href="/seller/dashboard">
                  <Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50 flex items-center">
                    Войти в личный кабинет продавца
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      }
    }

    // No application — show CTA
    return (
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-1">Стать продавцом</h2>
            <p className="text-sm text-zinc-300 mb-4">
              Создайте свой магазин и начните продавать товары на нашей платформе
            </p>
            <Link href="/profile/become-seller">
              <Button variant="secondary" className="bg-white text-zinc-900 hover:bg-gray-100">
                Начать продавать
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Profile header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{user.name}</h1>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
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

            <button className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group text-left">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Избранное</p>
                <p className="text-xs text-gray-500">Сохранённые товары</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group text-left">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Настройки</p>
                <p className="text-xs text-gray-500">Пароль, уведомления</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>

          {/* Seller banner / CTA */}
          {user.role !== 'ADMIN' && renderSellerBanner()}

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

      {/* Rejection details modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        {application?.rejectionReason && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Причина отклонения</h3>
            <div className="bg-red-50 rounded-lg p-4 text-sm text-red-800">
              {application.rejectionReason}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowRejectModal(false)}>
                Закрыть
              </Button>
              <Link href="/profile/become-seller" className="flex-1">
                <Button variant="primary" className="w-full" onClick={() => setShowRejectModal(false)}>
                  Внести изменения
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
