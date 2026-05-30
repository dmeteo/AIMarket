import Link from 'next/link'
import Header from '@/src/components/Header'

export default function AboutPage() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 font-sans antialiased'>
			<Header />
			<main className='py-16'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<h1 className='text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-12'>
						О нас
					</h1>
					<div className='bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8'>
						<div className='space-y-8'>
							<div>
								<h2 className='text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4'>
									Наша миссия
								</h2>
								<p className='text-zinc-600 dark:text-zinc-400 leading-relaxed'>
									Мы создаём современную платформу, которая помогает
									производителям и локальным брендам развивать свой бизнес в
									цифровой среде. Наша цель — объединить удобный маркетплейс,
									инструменты управления магазинами и AI-технологии в одном
									сервисе.
								</p>
								<p className='text-zinc-600 dark:text-zinc-400 leading-relaxed'>
									Мы верим, что качественный продукт заслуживает внимания
									независимо от размера компании. Именно поэтому наша платформа
									помогает бизнесу не только размещать товары, но и эффективно
									презентовать их, управлять продажами и взаимодействовать с
									клиентами через AI-помощника.
								</p>
							</div>

							<div>
								<h2 className='text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4'>
									Что представляет собой платформа
								</h2>
								<p className='text-zinc-600 dark:text-zinc-400 leading-relaxed'>
									Наш сервис — это не просто маркетплейс. Это экосистема для
									продавцов, брендов и покупателей. Платформа позволяет: •
									создавать и управлять несколькими магазинами • настраивать
									внешний вид витрины • управлять товарами, категориями и
									контентом • работать с модераторами и командой • анализировать
									продажи и активность • использовать AI-помощника для поиска и
									рекомендаций товаров Мы разрабатываем систему как
									масштабируемый SaaS-сервис нового поколения для электронной
									коммерции.
								</p>
							</div>

							<div>
								<h2 className='text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4'>
									Наши ценности
								</h2>
								<div className='space-y-4'>
									<div className='flex items-start'>
										<span className='flex-shrink-0 h-5 w-5 text-zinc-800 dark:text-zinc-200'>
											•
										</span>
										<span className='ml-3 text-zinc-600 dark:text-zinc-400'>
											Инновации: Мы постоянно исследуем новые подходы в области
											ИИ
										</span>
									</div>
									<div className='flex items-start'>
										<span className='flex-shrink-0 h-5 w-5 text-zinc-800 dark:text-zinc-200'>
											•
										</span>
										<span className='ml-3 text-zinc-600 dark:text-zinc-400'>
											Качество: Мы тщательно тестируем все наши модели и сервисы
										</span>
									</div>
									<div className='flex items-start'>
										<span className='flex-shrink-0 h-5 w-5 text-zinc-800 dark:text-zinc-200'>
											•
										</span>
										<span className='ml-3 text-zinc-600 dark:text-zinc-400'>
											Доступность: Мы делаем передовые технологии доступными для
											всех
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='mt-8 flex justify-center'>
						<Link
							href='/'
							className='px-6 py-3 bg-zinc-800 text-white rounded hover:bg-zinc-900 dark:hover:bg-zinc-700 transition-colors'
						>
							Вернуться на главную
						</Link>
					</div>
				</div>
			</main>
		</div>
	)
}
