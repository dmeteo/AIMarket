'use client'

import { useState, useRef } from 'react'
import { X, Upload, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import { uploadFile } from '../../services/upload.service'

interface ShopFormProps {
	shop?: {
		id: number
		title: string
		description: string
		logo_url: string | null
	}
	onSave: (data: {
		title: string
		description: string
		logo_url?: string
	}) => Promise<void>
	onCancel: () => void
	maxShops?: number
	currentCount?: number
}

export default function ShopForm({
	shop,
	onSave,
	onCancel,
	maxShops = 10,
	currentCount = 0,
}: ShopFormProps) {
	const [title, setTitle] = useState(shop?.title || '')
	const [description, setDescription] = useState(shop?.description || '')
	const [logoPreview, setLogoPreview] = useState<string | null>(
		shop?.logo_url || null,
	)
	const [logoUrl, setLogoUrl] = useState<string | undefined>(
		shop?.logo_url || undefined,
	)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const isEditing = !!shop
	const canCreate = isEditing || currentCount < maxShops

	const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		if (file.size > 5 * 1024 * 1024) {
			setError('Файл слишком большой. Максимум 5 МБ.')
			return
		}

		// Показываем локальный превью сразу
		const reader = new FileReader()
		reader.onload = ev => {
			setLogoPreview(ev.target?.result as string)
		}
		reader.readAsDataURL(file)

		// Загружаем на сервер
		setUploading(true)
		setError('')
		try {
			const result = await uploadFile(file, 'avatars')
			if (result.full_urls?.[0]) {
				setLogoUrl(result.full_urls[0])
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка загрузки изображения')
			setLogoPreview(null)
		}
		setUploading(false)
	}

	const removeLogo = () => {
		setLogoPreview(null)
		setLogoUrl(undefined)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleSubmit = async () => {
		if (!title.trim()) {
			setError('Введите название магазина')
			return
		}
		setSaving(true)
		setError('')
		try {
			await onSave({
				title: title.trim(),
				description: description.trim(),
				logo_url: logoUrl || '',
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка сохранения')
		}
		setSaving(false)
	}

	if (!canCreate) {
		return (
			<div className='text-center py-8'>
				<p className='text-gray-500 mb-4'>
					Достигнут лимит магазинов ({maxShops}). Удалите ненужные магазины для
					создания новых.
				</p>
				<Button variant='secondary' onClick={onCancel}>
					Закрыть
				</Button>
			</div>
		)
	}

	return (
		<div className='space-y-5'>
			{error && (
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2'>
					<AlertCircle className='h-4 w-4 flex-shrink-0' />
					{error}
				</div>
			)}

			<div>
				<label className='block text-sm font-medium text-gray-700 mb-1'>
					Название магазина <span className='text-red-500'>*</span>
				</label>
				<Input
					value={title}
					onChange={e => setTitle(e.target.value)}
					placeholder='Например: TechPro, AudioHub'
					maxLength={50}
				/>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-700 mb-1'>
					Описание
				</label>
				<Textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder='Расскажите о вашем магазине...'
					rows={3}
					maxLength={300}
				/>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-700 mb-2'>
					Логотип
				</label>
				<div className='flex items-center gap-4'>
					{logoPreview ? (
						<div className='relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200'>
							<Image
								src={logoPreview}
								alt='Logo'
								width={80}
								height={80}
								className='w-full h-full object-cover'
							/>
							{uploading && (
								<div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
									<Loader2 className='h-5 w-5 text-white animate-spin' />
								</div>
							)}
							<button
								onClick={removeLogo}
								className='absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600'
							>
								<X className='h-3 w-3' />
							</button>
						</div>
					) : (
						<button
							type='button'
							onClick={() => fileInputRef.current?.click()}
							className='w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors flex-shrink-0'
						>
							{uploading ? (
								<Loader2 className='h-5 w-5 animate-spin' />
							) : (
								<Upload className='h-5 w-5' />
							)}
							<span className='text-[10px]'>Логотип</span>
						</button>
					)}
					<div className='text-xs text-gray-500'>
						<p>JPG, PNG или GIF</p>
						<p>Максимум 5 МБ</p>
					</div>
					<input
						ref={fileInputRef}
						type='file'
						accept='image/jpeg,image/png,image/gif'
						onChange={handleLogoChange}
						className='hidden'
					/>
				</div>
			</div>

			<div className='flex items-center justify-between pt-2'>
				<p className='text-xs text-gray-400'>
					{currentCount}/{maxShops} магазинов
				</p>
				<div className='flex gap-3'>
					<Button variant='secondary' onClick={onCancel} disabled={saving}>
						Отмена
					</Button>
					<Button
						variant='primary'
						onClick={handleSubmit}
						disabled={saving || !title.trim()}
					>
						{saving
							? 'Сохранение...'
							: isEditing
								? 'Сохранить'
								: 'Создать магазин'}
					</Button>
				</div>
			</div>
		</div>
	)
}
