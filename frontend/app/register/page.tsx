'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Don't render the form while redirecting
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (name.length < 3) {
      setError('Имя должно содержать минимум 3 символа');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    const result = await register({ name, email, password });
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased">
      <Header />
      <main className="py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-center text-zinc-900 mb-8">
            Регистрация
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                Имя
              </label>
              <Input
                type="text"
                id="name"
                placeholder="Ваше имя"
                required
                minLength={3}
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                id="email"
                placeholder="you@example.com"
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
                minLength={6}
                maxLength={50}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Минимум 6 символов
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/login"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Уже есть аккаунт? Войти
              </Link>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
