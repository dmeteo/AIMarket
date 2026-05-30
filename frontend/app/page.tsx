import Header from '../src/components/Header'
import { ShoppingCart } from 'lucide-react'

export default function Home() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 font-sans antialiased'>
			<Header />
			<main>
				{/* Products Section */}
				<section className='py-16 bg-dark dark:zinc-900'>
					<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
						<h2 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8'>
							Товары
						</h2>
						<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
							{/* Product 1 */}
							<div className='relative border border-zinc-200 rounded-lg overflow-hidden bg-white dark:border-zinc-700 dark:bg-zinc-800'>
								<div className='h-48 flex items-center justify-center bg-zinc-50 dark:bg-zinc-700'>
									<span className='text-zinc-500 dark:text-zinc-400'>
										Изображение товара
									</span>
								</div>
								<div className='p-4'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
										Товар 1
									</h3>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2'>
										Описание товара 1. Краткое описание характеристик и
										возможностей.
									</p>
									<div className='mt-4 flex items-baseline'>
										<span className='text-zinc-900 font-bold dark:text-zinc-100'>
											$29.99
										</span>
										<button className='absolute bottom-2 right-2 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600'>
											<ShoppingCart className='h-5 w-5' />
										</button>
									</div>
								</div>
							</div>

							{/* Product 2 */}
							<div className='relative border border-zinc-200 rounded-lg overflow-hidden bg-white dark:border-zinc-700 dark:bg-zinc-800'>
								<div className='h-48 flex items-center justify-center bg-zinc-50 dark:bg-zinc-700'>
									<span className='text-zinc-500 dark:text-zinc-400'>
										Изображение товара
									</span>
								</div>
								<div className='p-4'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
										Товар 2
									</h3>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2'>
										Описание товара 2. Краткое описание характеристик и
										возможностей.
									</p>
									<div className='mt-4 flex items-baseline'>
										<span className='text-zinc-900 font-bold dark:text-zinc-100'>
											$39.99
										</span>
										<button className='absolute bottom-2 right-2 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600'>
											<ShoppingCart className='h-5 w-5' />
										</button>
									</div>
								</div>
							</div>

							{/* Product 3 */}
							<div className='relative border border-zinc-200 rounded-lg overflow-hidden bg-dark dark:border-zinc-700 dark:bg-zinc-800'>
								<div className='h-48 flex items-center justify-center bg-zinc-50 dark:bg-zinc-700'>
									<span className='text-zinc-500 dark:text-zinc-400'>
										Изображение товара
									</span>
								</div>
								<div className='p-4'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
										Товар 3
									</h3>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2'>
										Описание товара 3. Краткое описание характеристик и
										возможностей.
									</p>
									<div className='mt-4 flex items-baseline'>
										<span className='text-zinc-900 font-bold dark:text-zinc-100'>
											$49.99
										</span>
										<button className='absolute bottom-2 right-2 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600'>
											<ShoppingCart className='h-5 w-5' />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* New Arrivals Section */}
				<section className='py-16 bg-zinc-50 dark:bg-zinc-900'>
					<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
						<h2 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8'>
							Новинки
						</h2>
						<div className='space-y-6'>
							{/* New Arrival 1 */}
							<div className='flex items-center gap-6 border-b border-zinc-200 pb-6 dark:border-zinc-700'>
								<div className='h-32 w-32 flex-shrink-0 border border-zinc-200 rounded-lg bg-white dark:border-zinc-700 dark:bg-zinc-800'>
									<span className='text-zinc-500 dark:text-zinc-400 flex items-center justify-center h-full'>
										Изображение
									</span>
								</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
										Новинка 1
									</h3>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
										Последняя добавленная модель с улучшенными характеристиками.
									</p>
								</div>
							</div>

							{/* New Arrival 2 */}
							<div className='flex items-center gap-6 border-b border-zinc-200 pb-6 dark:border-zinc-700'>
								<div className='h-32 w-32 flex-shrink-0 border border-zinc-200 rounded-lg bg-white dark:border-zinc-700 dark:bg-zinc-800'>
									<span className='text-zinc-500 dark:text-zinc-400 flex items-center justify-center h-full'>
										Изображение
									</span>
								</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
										Новинка 2
									</h3>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
										Инновационное решение для обработки естественного языка.
									</p>
								</div>
							</div>

							{/* New Arrival 3 */}
							<div className='flex items-center gap-6 border-b border-zinc-200 pb-6 dark:border-zinc-700'>
								<div className='h-32 w-32 flex-shrink-0 border border-zinc-200 rounded-lg bg-white dark:border-zinc-700 dark:bg-zinc-800'>
									<span className='text-zinc-500 dark:text-zinc-400 flex items-center justify-center h-full'>
										Изображение
									</span>
								</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
										Новинка 3
									</h3>
									<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
										Модель компьютерного зрения с высокой точностью
										распознавания.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Promotions Section */}
				<section className='py-16 bg-dark dark:zinc-900'>
					<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
						<h2 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8'>
							Акции и скидки
						</h2>
						<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
							{/* Promotion 1 */}
							<div className='border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800'>
								<div className='flex items-center justify-center h-32 mb-4'>
									<span className='text-zinc-500 dark:text-zinc-400'>🎯</span>
								</div>
								<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
									Специальное предложение
								</h3>
								<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
									Скидка 20% на все модели NLP
								</p>
								<p className='mt-1 text-zinc-500 dark:text-zinc-400'>
									Действует до: 30.06.2026
								</p>
							</div>

							{/* Promotion 2 */}
							<div className='border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800'>
								<div className='flex items-center justify-center h-32 mb-4'>
									<span className='text-zinc-500 dark:text-zinc-400'>💥</span>
								</div>
								<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
									Летняя распродажа
								</h3>
								<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
									Скидка до 50% на выбранные товары
								</p>
								<p className='mt-1 text-zinc-500 dark:text-zinc-400'>
									Только эту неделю
								</p>
							</div>

							{/* Promotion 3 */}
							<div className='border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800'>
								<div className='flex items-center justify-center h-32 mb-4'>
									<span className='text-zinc-500 dark:text-zinc-400'>⭐</span>
								</div>
								<h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
									Бонусная программа
								</h3>
								<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
									Заработайте кредиты за рекомендации
								</p>
								<p className='mt-1 text-zinc-500 dark:text-zinc-400'>
									Пригласите друдов и получите бонусы
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className='border-t border-zinc-200 dark:border-zinc-700'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8'>
					<div className='flex flex-col sm:flex-row sm:justify-between'>
						<span className='text-sm text-zinc-500 dark:text-zinc-400'>
							© 2026 AI Market. All rights reserved.
						</span>
						<div className='mt-4 flex flex-col sm:flex-row sm:mt-0 sm:space-x-4'>
							<a
								href='#'
								className='text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
							>
								Terms
							</a>
							<a
								href='#'
								className='ml-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
							>
								Privacy
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
