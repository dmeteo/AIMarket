import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../../hooks/useProducts';

interface AIProductCardProps {
  product: Product;
  index: number;
  onProductClick?: () => void;
}

export default function AIProductCard({ product, index, onProductClick }: AIProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      onClick={onProductClick}
      className="flex gap-2.5 bg-gray-50 rounded-lg border border-gray-200 p-2 hover:border-gray-300 hover:shadow-sm transition-all animate-card-appear group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={product.images?.[0] ?? '/placeholder.svg'}
          alt={product.title}
          width={40}
          height={40}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.title}</p>
        <p className="text-xs font-semibold text-gray-700 mt-0.5">{parseFloat(product.final_price).toFixed(0)} ₽</p>
      </div>
    </Link>
  );
}
