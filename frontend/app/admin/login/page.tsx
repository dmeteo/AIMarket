'use client';

import { useState } from 'react';
import Header from '../../../components/Header';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ADMIN_EMAIL = 'admin@aimarket.com';
const ADMIN_PASSWORD = 'admin123';

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('[AdminLogin] Credentials OK, setting session...');
      const adminUser = {
        id: 999,
        name: 'Администратор',
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        is_active: true,
        orders_count: 0,
      };
      const token = 'admin-mock-token';

      // Set cookies for middleware
      setCookie('auth_token', token);
      setCookie('auth_user', JSON.stringify(adminUser));

      // Also set localStorage for client-side auth
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(adminUser));

      console.log('[AdminLogin] Redirecting to /admin/dashboard...');
      window.location.href = '/admin/dashboard';
    } else {
      setError('Неверный email или пароль');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Вход для администратора</h1>
            <p className="text-sm text-gray-500 mt-2">Введите учётные данные администратора</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                id="email"
                placeholder="admin@aimarket.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                Пароль
              </label>
              <Input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
