'use client';

import { Star } from 'lucide-react';
import type { Review } from '../services/review.service';

interface ReviewsSectionProps {
  reviews: Review[];
  productId: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderStars(rate: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rate ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews, productId }: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
      <div id={`reviews-${productId}`} className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Отзывы</h2>
        <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length;

  return (
    <div id={`reviews-${productId}`} className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Отзывы</h2>
        <div className="flex items-center gap-1.5">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <span className="text-base font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{reviews.length} отзывов</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{review.user_name}</span>
                {renderStars(review.rate)}
              </div>
              <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
            </div>
            {review.text && (
              <p className="text-sm text-gray-600 leading-relaxed mt-1">{review.text}</p>
            )}
            {review.edited && (
              <span className="text-xs text-gray-400 mt-1 block">ред.</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
