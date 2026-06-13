'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Eye, ChevronRight, Search } from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminNavItems } from '../../../components/admin/admin-nav';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Textarea from '../../../components/ui/Textarea';
import { useAuth } from '../../../hooks/useAuth';
import { sellerService } from '../../../services/seller.service';
import type { SellerApplication } from '../../../services/seller.service';

const statusConfig = {
  PENDING: { label: 'На проверке', variant: 'warning' as const, icon: Clock },
  APPROVED: { label: 'Одобрена', variant: 'success' as const, icon: CheckCircle },
  REJECTED: { label: 'Отклонена', variant: 'destructive' as const, icon: XCircle },
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  useEffect(() => {
    if (isLoading) return;
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let isAdmin = false;
    if (token && userStr) {
      try { isAdmin = JSON.parse(userStr).role === 'ADMIN'; } catch { /* ignore */ }
    }
    if (!isAdmin) {
      console.log('[AdminApps] Redirecting to /login...');
      window.location.href = '/login';
    }
  }, [isAuthenticated, user, router, isLoading]);

  useEffect(() => {
    sellerService.getApplications().then(setApplications).catch(() => {});
  }, []);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const handleApprove = async (id: number) => {
    setLoading(true);
    try {
      await sellerService.approveApplication(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' as const } : a)),
      );
      setSelectedApp(null);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      await sellerService.rejectApplication(selectedApp.id, rejectReason);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id
            ? { ...a, status: 'REJECTED' as const, rejectionReason: rejectReason }
            : a,
        ),
      );
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectReason('');
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <AdminLayout navItems={adminNavItems} title="Заявки на регистрацию">
      <div className="space-y-4">
        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Поиск по имени, email, магазину..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all' as const, label: 'Все' },
              { value: 'PENDING' as const, label: 'На проверке' },
              { value: 'APPROVED' as const, label: 'Одобренные' },
              { value: 'REJECTED' as const, label: 'Отклонённые' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === tab.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {applications.filter((app) => {
          if (statusFilter !== 'all' && app.status !== statusFilter) return false;
          if (search) {
            const q = search.toLowerCase();
            const matchName = app.full_name?.toLowerCase().includes(q);
            const matchEmail = app.email?.toLowerCase().includes(q);
            if (!matchName && !matchEmail) return false;
          }
          return true;
        }).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Ничего не найдено</p>
          </div>
        ) : (
          applications
            .filter((app) => {
              if (statusFilter !== 'all' && app.status !== statusFilter) return false;
              if (search) {
                const q = search.toLowerCase();
                const matchName = app.full_name?.toLowerCase().includes(q);
                const matchEmail = app.email?.toLowerCase().includes(q);
                if (!matchName && !matchEmail) return false;
              }
              return true;
            })
            .map((app) => {
            const status = statusConfig[app.status];
            const StatusIcon = status.icon;
            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{app.full_name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Заявка на регистрацию продавца</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Подана: {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                    Подробнее
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)}>
        {selectedApp && selectedApp.id !== 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Заявка #{selectedApp.id}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                selectedApp.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                selectedApp.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {statusConfig[selectedApp.status].label}
              </span>
            </div>

            {/* Seller data */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Данные продавца</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <p><span className="text-gray-500">Имя:</span> {selectedApp.full_name}</p>
                <p><span className="text-gray-500">Email:</span> {selectedApp.email}</p>
                <p><span className="text-gray-500">Телефон:</span> {selectedApp.phone}</p>
                <p><span className="text-gray-500">О себе:</span> {selectedApp.description}</p>
              </div>
            </div>

            {/* Legal data */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Юридические данные</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <p><span className="text-gray-500">Тип:</span> {selectedApp.person_type}</p>
                <p><span className="text-gray-500">ИНН:</span> {selectedApp.inn}</p>
                <p><span className="text-gray-500">ОГРН:</span> {selectedApp.ogrn}</p>
                <p><span className="text-gray-500">Адрес:</span> {selectedApp.address}</p>
              </div>
            </div>

            {/* Shop info note */}
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              💡 После одобрения продавец сможет создать до 10 магазинов в своём личном кабинете.
            </div>

            {/* Rejection reason */}
            {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Причина отклонения</h4>
                <div className="bg-red-50 rounded-lg p-3 text-sm text-red-800">
                  {selectedApp.rejectionReason}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedApp.status === 'PENDING' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4" />
                  Одобрить
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4" />
                  Отклонить
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Отклонить заявку</h3>
          <p className="text-sm text-gray-500">Укажите причину отклонения — она будет отправлена заявителю.</p>
          <Textarea
            placeholder="Причина отклонения..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowRejectModal(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              disabled={!rejectReason.trim() || loading}
            >
              Отклонить
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
