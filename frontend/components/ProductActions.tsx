'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cart.store';

interface ProductActionsProps {
  productId: number;
  title: string;
  price: string;
  finalPrice: string;
  stock: number;
}

export default function ProductActions({
  productId,
  title,
  price,
  finalPrice,
  stock,
}: ProductActionsProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItem = useCartStore((s) => s.items.find((i) => i.id === productId));
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;

  const inStock = stock > 0;
  const total = (parseFloat(finalPrice) * cartQty).toFixed(2);

  const handleAdd = () => {
    addItem({
      id: productId,
      title,
      price,
      final_price: finalPrice,
      image: '/placeholder.svg',
    }, 1);
  };

  const handleGoToCart = () => {
    router.push('/cart');
  };

  const handleIncrement = () => {
    updateQuantity(productId, cartQty + 1);
  };

  const handleDecrement = useCallback(() => {
    if (cartQty <= 1) {
      useCartStore.getState().removeItem(productId);
    } else {
      updateQuantity(productId, cartQty - 1);
    }
  }, [cartQty, productId, updateQuantity]);

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* Price / Total */}
      {inCart && cartQty > 0 ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Итого:</span>
          <span className="text-xl font-bold text-gray-900">{total} ₽</span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Цена:</span>
          <span className="text-xl font-bold text-gray-900">
            {parseFloat(finalPrice).toFixed(0)} ₽
          </span>
        </div>
      )}

      {/* Actions row */}
      <div className="flex gap-2 items-stretch">
        {/* Main button — full width when not in cart, shrinks when in cart */}
        {inCart ? (
          <button
            onClick={handleGoToCart}
            className="flex-1 h-11 rounded-xl text-sm font-medium cursor-pointer
              bg-green-600 text-white hover:bg-green-700 active:scale-95
              transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4 flex-shrink-0" />
            В корзине
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="flex-1 h-11 px-4 rounded-xl text-base font-medium cursor-pointer select-none
              active:scale-95
              transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              bg-zinc-900 text-white hover:bg-zinc-800
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {inStock ? 'В корзину' : 'Нет в наличии'}
          </button>
        )}

        {/* Quantity panel — only rendered when in cart, slides in via CSS */}
        <div
          className="h-11 flex items-center flex-shrink-0 rounded-xl overflow-hidden border border-gray-300
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            motion-reduce:transition-none"
          style={{
            width: inCart ? '132px' : '0px',
            opacity: inCart ? 1 : 0,
            marginLeft: inCart ? '0px' : '-8px',
            pointerEvents: inCart ? 'auto' : 'none',
          }}
        >
          <button
            onClick={handleDecrement}
            className="w-11 h-11 flex-shrink-0 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors active:scale-95"
            aria-label="Уменьшить"
          >
            <Minus className="h-4 w-4 text-gray-700" />
          </button>
          <span className="w-11 h-11 flex-shrink-0 text-center text-base font-semibold text-gray-900 bg-white border-x border-gray-300 flex items-center justify-center">
            {cartQty}
          </span>
          <button
            onClick={handleIncrement}
            disabled={cartQty >= Math.min(stock, 99)}
            className="w-11 h-11 flex-shrink-0 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="Увеличить"
          >
            <Plus className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
