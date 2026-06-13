'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import ProductGallery from '../../../components/ProductGallery';
import ProductInfo from '../../../components/ProductInfo';
import ProductDescription from '../../../components/ProductDescription';
import ProductActions from '../../../components/ProductActions';
import ReviewsSection from '../../../components/ReviewsSection';
import Skeleton from '../../../components/ui/Skeleton';
import { useProduct } from '../../../hooks/useProducts';
import { reviewService, type Review } from '../../../services/review.service';
import ShopCard from '../../../components/ShopCard';
import shopsData from '../../../mocks/data/seller-shops.json';
import type { SellerShop } from '../../../services/seller.service';
import { ChevronRight } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const { data, status, error } = useProduct(id);
  const product = data;
  const [reviews, setReviews] = useState<Review[]>([]);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Find shop by product's shop_id
  const shop = product
    ? (shopsData as { shops: Array<{ id: number; seller_id: number; title: string; description: string; logo_url: string | null; products_count: number; orders_count: number; reviews_count: number; revenue: number; is_active: boolean; created_at: string }> }).shops.find((s) => s.id === product.shop_id) ?? null
    : null;

  useEffect(() => {
    if (product) {
      reviewService.getReviews(id).then(setReviews).catch(() => {});
    }
  }, [product, id]);

  const handleRatingClick = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Build breadcrumbs from categories
  const breadcrumbs = product?.categories ?? [];

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
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
              Главная
            </Link>
            {breadcrumbs.map((cat, i) => (
              <span key={cat.id} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{cat.title}</span>
                ) : (
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {cat.title}
                  </Link>
                )}
              </span>
            ))}
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
                reviewsCount={product.reviews_count}
                category={product.categories?.[0]?.title}
                isNew={product.isNew ?? false}
                isBestSeller={product.isBestSeller ?? false}
                quantity={product.quantity}
                onRatingClick={handleRatingClick}
              />

              <ProductActions
                productId={product.id}
                title={product.title}
                price={product.price}
                finalPrice={product.final_price}
                stock={product.quantity}
              />

              {shop && <ShopCard shop={shop as SellerShop} />}
            </div>
          </div>

          {/* Description — full width below */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ProductDescription description={product.description} />
          </div>

          {/* Reviews */}
          <div ref={reviewsRef}>
            <ReviewsSection reviews={reviews} productId={product.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
