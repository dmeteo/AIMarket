import Header from '@/src/components/Header';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 font-sans antialiased">
      <Header />
      <main className="py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-8">
            Вход
          </h1>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                className="w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link href="/register" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Нет аккаунта? Регистрация
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-900 dark:hover:bg-zinc-700 transition-colors"
              >
                Войти
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
