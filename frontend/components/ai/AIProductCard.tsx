import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Check, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import type { Product } from '../../hooks/useProducts';

interface AIProductCardProps {
  product: Product;
  index: number;
  onProductClick?: () => void;
}

export default function AIProductCard({ product, index, onProductClick }: AIProductCardProps) {
  const router = useRouter();
  const hasDiscount = parseFloat(product.discount_percent) > 0;
  const imageUrl = product.images?.[0] || '/placeholder.svg';
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = cartItems.some((item) => item.id === product.id);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (inCart) {
      router.push('/cart');
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      final_price: product.final_price,
      image: imageUrl,
    }, 1);

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={onProductClick}
      className="group block cursor-pointer animate-card-appear"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:shadow-md active:translate-y-0">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Wishlist toggled for product:', product.id);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {product.isNew && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                Новинка
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                Бестселлер
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="absolute bottom-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
              -{Math.round(parseFloat(product.discount_percent))}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-10">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            {hasDiscount ? (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {parseFloat(product.price).toFixed(0)} ₽
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {parseFloat(product.final_price).toFixed(0)} ₽
                </span>
              </>
            ) : (
              <span className="text-base font-semibold text-gray-900">
                {parseFloat(product.price).toFixed(0)} ₽
              </span>
            )}
          </div>

          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center text-xs text-yellow-500 mb-3">
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
              <span className="ml-1 text-gray-500">{product.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Cart button */}
          <button
            onClick={handleButtonClick}
            className={`
              w-full px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200 ease-out
              cursor-pointer select-none
              active:scale-95 active:shadow-inner
              ${inCart
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }
              ${justAdded ? 'scale-95' : ''}
            `}
          >
            <span className="flex items-center justify-center gap-1.5">
              {inCart ? (
                <>
                  <Check className="h-4 w-4" />
                  В корзине
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  В корзину
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
