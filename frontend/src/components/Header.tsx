import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart } from 'lucide-react'
import Input from './ui/Input'
import Button from './ui/Button'

interface HeaderProps {
	className?: string
}

export default function Header({ className }: HeaderProps) {
	return (
		<header
			className={`border-b border-zinc-200 dark:border-zinc-700 ${className}`}
		>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16 items-center'>
					{/* Logo */}
					<Link href='/' className='-m-0.5 p-0.5 flex items-center'>
						<h2 className='fw-700'>AI Market</h2>
					</Link>

					{/* Search and Navigation */}
					<div className='hidden md:flex items-center space-x-6'>
						{/* Navigation Links */}
						<div className='space-x-4'>
							<Link
								href='/'
								className='text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
							>
								Главная
							</Link>
							<Link
								href='/market'
								className='text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
							>
								Каталог
							</Link>
							<Link
								href='/about'
								className='text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
							>
								О нас
							</Link>
						</div>
					</div>

					{/* Search */}
					<div className='relative w-64'>
						<Input
							type='search'
							placeholder='Поиск...'
							className='pl-10 active:border-none'
							variant='standard'
						/>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500' />
					</div>

					{/* Auth and Cart */}
					<div className='flex items-center space-x-4'>
						{/* Cart */}
						<Link href='/cart' className='relative'>
							<ShoppingCart className='h-5 w-5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100' />
							<span className='absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center bg-zinc-900 text-zinc-50 rounded-full text-xs dark:bg-zinc-100'>
								0
							</span>
						</Link>

						{/* Auth Buttons */}
						<div className='space-x-2'>
							<Link
								href='/login'
								className='text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
							>
								Войти
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}
