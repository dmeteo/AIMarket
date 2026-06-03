import Badge from './ui/Badge';

interface ProductInfoProps {
  title: string;
  price: string;
  finalPrice: string;
  discountPercent: string;
  rating: number | null;
  category?: string;
  isNew: boolean;
  isBestSeller: boolean;
  quantity: number;
}

export default function ProductInfo({
  title,
  price,
  finalPrice,
  discountPercent,
  rating,
  category,
  isNew,
  isBestSeller,
  quantity,
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

      {/* Rating */}
      {rating !== null && rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center text-yellow-500">
            {'★'.repeat(Math.floor(rating))}
            {'☆'.repeat(5 - Math.floor(rating))}
          </div>
          <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
        </div>
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
