import Link from 'next/link';
import Header from '@/src/components/Header';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 font-sans antialiased">
      <Header />
      <main className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-8">
            Ваша корзина
          </h1>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
            <p className="text-zinc-600 dark:text-zinc-400 text-center">
              Ваша корзина пока пуста.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/" className="px-6 py-3 bg-zinc-800 text-white rounded hover:bg-zinc-900 dark:hover:bg-zinc-700 transition-colors">
                Вернуться к покупкам
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}