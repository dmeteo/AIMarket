'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '../../../components/Header';
import { useAuth } from '../../../hooks/useAuth';
import SellerApplicationForm from '../../../components/seller/SellerApplicationForm';

const STORAGE_KEY = 'seller_application_form';

export default function BecomeSellerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check localStorage directly to prevent false redirect
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[BecomeSeller] No token, redirecting to /login');
      window.location.href = '/login';
    }
  }, [isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад в профиль
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Стать продавцом</h1>
          <SellerApplicationForm storageKey={STORAGE_KEY} />
        </div>
      </main>
    </div>
  );
}
