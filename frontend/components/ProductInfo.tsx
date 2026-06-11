import Badge from './ui/Badge';
import { Star } from 'lucide-react';

interface ProductInfoProps {
  title: string;
  price: string;
  finalPrice: string;
  discountPercent: string;
  rating: number | null;
  reviewsCount?: number;
  category?: string;
  isNew: boolean;
  isBestSeller: boolean;
  quantity: number;
  onRatingClick?: () => void;
}

export default function ProductInfo({
  title,
  price,
  finalPrice,
  discountPercent,
  rating,
  reviewsCount = 0,
  category,
  isNew,
  isBestSeller,
  quantity,
  onRatingClick,
}: ProductInfoProps) {
  const hasDiscount = parseFloat(discountPercent) > 0;

  return (
    <div className="space-y-4">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {isNew && <Badge variant="primary">Новинка</Badge>}
        {isBestSeller && <Badge variant="success">Бестселлер</Badge>}
        {category && <Badge variant="muted">{category}</Badge>}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      {/* Rating — clickable */}
      {rating !== null && rating > 0 && (
        <button
          onClick={onRatingClick}
          className="flex items-center gap-1.5 group cursor-pointer"
        >
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{rating}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">{reviewsCount.toLocaleString('ru-RU')} отзыва</span>
        </button>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        {hasDiscount ? (
          <>
            <span className="text-3xl font-bold text-gray-900">
              {parseFloat(finalPrice).toFixed(0)} ₽
            </span>
            <span className="text-lg text-gray-400 line-through">
              {parseFloat(price).toFixed(0)} ₽
            </span>
            <span className="text-sm font-medium text-green-600">
              -{Math.round(parseFloat(discountPercent))}%
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-gray-900">
            {parseFloat(price).toFixed(0)} ₽
          </span>
        )}
      </div>

      {/* Availability */}
      <div className="text-sm">
        {quantity > 0 ? (
          <span className="text-green-600">✓ В наличии ({quantity} шт.)</span>
        ) : (
          <span className="text-red-500">✗ Нет в наличии</span>
        )}
      </div>
    </div>
  );
}
