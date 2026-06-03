'use client';

import Header from '../components/Header';
import ProductList from '../components/ProductList';
import OrdersWidget from '../components/widgets/OrdersWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <OrdersWidget />
          <ProductList />
        </div>
      </main>
    </div>
  );
}
