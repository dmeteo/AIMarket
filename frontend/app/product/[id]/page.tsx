'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '../../../components/Header';
import ProductGallery from '../../../components/ProductGallery';
import ProductInfo from '../../../components/ProductInfo';
import ProductDescription from '../../../components/ProductDescription';
import ProductActions from '../../../components/ProductActions';
import Skeleton from '../../../components/ui/Skeleton';
import { useProduct } from '../../../hooks/useProducts';

export default function ProductPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const { data, status, error } = useProduct(id);
  const product = data;

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'error' || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
            <p className="text-gray-600 mb-8">
              {error?.message || 'Запрашиваемый товар не существует или был удалён.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-zinc-900 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться на главную
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Назад к каталогу
            </Link>
          </nav>

          {/* Product grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Gallery */}
            <ProductGallery images={product.images} title={product.title} />

            {/* Right: Info + Actions */}
            <div className="space-y-6">
              <ProductInfo
                title={product.title}
                price={product.price}
                finalPrice={product.final_price}
                discountPercent={product.discount_percent}
                rating={product.rating}
                category={product.category}
                isNew={product.isNew ?? false}
                isBestSeller={product.isBestSeller ?? false}
                quantity={product.quantity}
              />

              <ProductActions
                productId={product.id}
                title={product.title}
                price={product.price}
                finalPrice={product.final_price}
                stock={product.quantity}
              />
            </div>
          </div>

          {/* Description — full width below */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ProductDescription description={product.description} />
          </div>
        </div>
      </main>
    </div>
  );
}
