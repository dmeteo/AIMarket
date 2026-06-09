'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import SellerLayout from '../../../components/seller/SellerLayout';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

export default function SellerSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [form] = useState({
    entityType: 'ИП',
    inn: '771234567890',
    ogrn: '321774600000000',
    legalAddress: 'г. Москва, ул. Тверская, д. 1',
    bankBik: '044525225',
    bankAccount: '40702810100000000001',
  });

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isSeller = false;
    if (token && userStr) {
      try { isSeller = JSON.parse(userStr).role === 'SELLER'; } catch { /* ignore */ }
    }
    if (!isSeller) {
      console.log('[SellerSettings] Redirecting to /login...');
      window.location.href = '/login';
    }
  }, [isAuthenticated, router, isLoading]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <SellerLayout title="Настройки">
      <div className="max-w-2xl space-y-6">
        {/* Legal info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Юридические данные</h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Только чтение</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Тип лица</label>
              <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{form.entityType}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ИНН</label>
                <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{form.inn}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ОГРН</label>
                <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{form.ogrn}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Юридический адрес</label>
              <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{form.legalAddress}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">БИК</label>
                <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{form.bankBik}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Расчётный счёт</label>
                <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{form.bankAccount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => alert('Запрос на изменение юридических данных отправлен администратору.')}>
            <Save className="h-4 w-4 mr-2" />
            Запрос на изменение данных
          </Button>
        </div>
      </div>
    </SellerLayout>
  );
}
