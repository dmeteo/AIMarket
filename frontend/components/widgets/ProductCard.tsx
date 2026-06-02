import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  discountPercentage?: number;
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  imageUrl,
  rating = 0,
  isNew = false,
  isBestSeller = false,
  discountPercentage = 0,
}: ProductCardProps) => {
  const discountedPrice = discountPercentage > 0
    ? price * (1 - discountPercentage / 100)
    : null;

  return (
    <div className="group relative overflow-hidden bg-white rounded-lg border border-gray-200">
      {/* Image Container */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Изображение
          </div>
        )}

        {/* New/Best Seller Badges */}
        {isNew && (
          <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Новинка
          </div>
        )}

        {isBestSeller && (
          <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            Бестселлер
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={() => console.log('Wishlist toggled for product:', id)} 
            className="p-2 rounded-full bg-white/80 hover:bg-gray-100 transition-colors"
          >
            <Heart className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{name}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{description}</p>

        {/* Price Section */}
        <div className="flex items-baseline mb-2">
          {discountedPrice ? (
            <>
              <span className="text-xs text-gray-400 line-through mr-2">
                ${price.toFixed(2)}
              </span>
              <span className="text-base font-semibold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-900">
              ${price.toFixed(2)}
            </span>
          )}

          {/* Rating */}
          {rating > 0 && (
            <div className="ml-4 flex items-center text-xs text-yellow-500">
              {'★'.repeat(Math.floor(rating))}
              {'☆'.repeat(5 - Math.floor(rating))}
              <span className="ml-1 text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm">
          В корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;