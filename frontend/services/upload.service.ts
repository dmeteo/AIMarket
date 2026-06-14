import api from '../lib/api'

export interface UploadResponse {
	full_urls: string[]
	keys: string[]
}

/**
 * Загрузка файлов на сервер
 * @param files - массив файлов для загрузки
 * @param entity - тип сущности: 'products' для товаров, 'avatars' для логотипов/аватаров
 */
export async function uploadFiles(
	files: File[],
	entity: 'products' | 'avatars',
): Promise<UploadResponse> {
	const formData = new FormData()
	for (const file of files) {
		formData.append('files', file)
	}

	const response = await api.post<UploadResponse>(
		`/api/v1/media/upload?entity=${entity}`,
		formData,
		{
			headers: { 'Content-Type': 'multipart/form-data' },
		},
	)
	return response.data
}

/**
 * Загрузка одного файла
 */
export async function uploadFile(
	file: File,
	entity: 'products' | 'avatars',
): Promise<UploadResponse> {
	return uploadFiles([file], entity)
}
