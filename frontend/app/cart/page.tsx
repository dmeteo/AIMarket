'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Header from '../../components/Header';
import Button from '../../components/ui/Button';
import { useCartStore } from '../../store/cart.store';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const total = totalPrice().toFixed(2);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Корзина пуста</h1>
            <p className="text-gray-600 mb-8">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Перейти в каталог
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
		<div className='min-h-screen bg-gray-50'>
			<Header />
			<main className='py-8'>
				<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
					{/* Header */}
					<div className='flex items-center justify-between mb-6'>
						<div>
							<Link
								href='/'
								className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2'
							>
								<ArrowLeft className='h-4 w-4 mr-1' />
								Назад к каталогу
							</Link>
							<h1 className='text-2xl font-bold text-gray-900'>
								Корзина
								<span className='text-gray-400 font-normal text-lg ml-2'>
									({itemCount} {itemCount === 1 ? 'товар' : 'товаров'})
								</span>
							</h1>
						</div>
						{!showClearConfirm ? (
							<button
								onClick={() => setShowClearConfirm(true)}
								className='text-sm text-red-600 hover:text-red-700 flex items-center gap-1'
							>
								<Trash2 className='h-4 w-4' />
								Очистить корзину
							</button>
						) : (
							<div className='flex items-center gap-2'>
								<span className='text-sm text-gray-500'>Удалить всё?</span>
								<button
									onClick={() => {
										clearCart()
										setShowClearConfirm(false)
									}}
									className='text-sm text-red-600 hover:text-red-700 font-medium'
								>
									Да
								</button>
								<button
									onClick={() => setShowClearConfirm(false)}
									className='text-sm text-gray-500 hover:text-gray-700'
								>
									Нет
								</button>
							</div>
						)}
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Cart items */}
						<div className='lg:col-span-2 space-y-4'>
							{items.map(item => (
								<div
									key={item.id}
									className='flex gap-4 bg-white p-4 rounded-lg border border-gray-200'
								>
									{/* Image */}
									<Link
										href={`/product/${item.id}`}
										className='flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-gray-100'
									>
										<Image
											src={item.image}
											alt={item.title}
											width={96}
											height={96}
											className='w-full h-full object-cover'
										/>
									</Link>

									{/* Info */}
									<div className='flex-1 min-w-0'>
										<Link
											href={`/product/${item.id}`}
											className='text-sm font-medium text-gray-900 hover:text-gray-700 line-clamp-2'
										>
											{item.title}
										</Link>
										<p className='text-lg font-semibold text-gray-900 mt-1'>
											{parseFloat(item.final_price).toFixed(0)} ₽
										</p>

										{/* Quantity + Remove */}
										<div className='flex items-center justify-between mt-3'>
											<div className='flex items-center gap-2'>
												<button
													onClick={() =>
														updateQuantity(item.id, item.quantity - 1)
													}
													className='w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors'
													aria-label='Уменьшить'
												>
													<Minus className='h-3 w-3' />
												</button>
												<span className='w-8 text-center font-medium'>
													{item.quantity}
												</span>
												<button
													onClick={() =>
														updateQuantity(item.id, item.quantity + 1)
													}
													className='w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors'
													aria-label='Увеличить'
												>
													<Plus className='h-3 w-3' />
												</button>
											</div>
											<button
												onClick={() => removeItem(item.id)}
												className='text-gray-400 hover:text-red-600 transition-colors p-1'
												aria-label='Удалить'
											>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
									</div>

									{/* Item total */}
									<div className='flex-shrink-0 text-right'>
										<p className='text-lg font-semibold text-gray-900'>
											{(parseFloat(item.final_price) * item.quantity).toFixed(
												0,
											)}{' '}
											₽
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Order summary */}
						<div className='lg:col-span-1'>
							<div className='bg-white p-6 rounded-lg border border-gray-200 sticky top-4'>
								<h2 className='text-lg font-semibold text-gray-900 mb-4'>
									Итого заказа
								</h2>

								<div className='space-y-3 mb-4'>
									<div className='flex justify-between text-sm'>
										<span className='text-gray-500'>Товары ({itemCount})</span>
										<span className='text-gray-900'>{total} ₽</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span className='text-gray-500'>Доставка</span>
										<span className='text-gray-500'>От 199 ₽</span>
									</div>
								</div>

								<div className='border-t border-gray-200 pt-4 mb-6'>
									<div className='flex justify-between'>
										<span className='text-base font-semibold text-gray-900'>
											Итого
										</span>
										<span className='text-xl font-bold text-gray-900'>
											{total} ₽
										</span>
									</div>
								</div>

								<Link href='/checkout'>
									<Button variant='primary' className='w-full py-3 text-base'>
										Оформить заказ
									</Button>
								</Link>

								<Link
									href='/'
									className='block text-center text-sm text-gray-500 hover:text-gray-700 mt-3'
								>
									Продолжить покупки
								</Link>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
