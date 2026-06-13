import api from '../lib/api'

export interface ProductCard {
	id: number
	title: string
	images: string[]
	price: string
	discount_percent: string
	final_price: string
	rating: number | null
	reviews_count: number
	quantity: number
}

export interface Product {
	id: number
	shop_id: number
	title: string
	description: string
	images: string[]
	price: string
	discount_percent: string
	final_price: string
	rating: number | null
	reviews_count: number
	quantity: number
	categories?: Array<{ id: number; title: string }>
	category_id?: number | null
	category?: string | null
	is_active?: boolean
	shop_ids?: number[]
	created_at?: string
	updated_at?: string
}

export interface ProductsResponse {
	products: ProductCard[]
	total: number
	page: number
	limit: number
	pages: number
}

export interface CreateProductRequest {
	shop_id: number // ← ОБЯЗАТЕЛЬНОЕ поле по OpenAPI
	title: string
	description?: string
	images?: string[]
	price: string | number
	category_ids?: number[]
	discount_percent?: number
	quantity?: number
	is_active?: boolean
}

export interface UpdateProductRequest {
	title?: string
	description?: string
	images?: string[]
	price?: string | number
	category_ids?: number[]
	discount_percent?: number
	quantity?: number
	is_active?: boolean
}

export const productService = {
	// POST /api/v1/products/ — ответ обёрнут в { product: ... }
	async createProduct(data: CreateProductRequest): Promise<Product> {
		const response = await api.post<{ product: Product }>(
			'/api/v1/products/',
			data,
		)
		return response.data.product // распаковка
	},

	// PATCH /api/v1/products/:id — ответ обёрнут в { product: ... }
	async updateProduct(
		id: number,
		data: UpdateProductRequest,
	): Promise<Product> {
		const response = await api.patch<{ product: Product }>(
			`/api/v1/products/${id}`,
			data,
		)
		return response.data.product // распаковка
	},

	async deleteProduct(id: number): Promise<{ id: number }> {
		const response = await api.delete<{ id: number }>(`/api/v1/products/${id}`)
		return response.data
	},

	async assignToShops(
		productId: number,
		shopIds: number[],
		priceOverrides?: Record<number, string>,
	): Promise<Product> {
		const response = await api.post<{ product: Product }>(
			`/api/v1/products/${productId}/assign`,
			{
				shop_ids: shopIds,
				price_overrides: priceOverrides,
			},
		)
		return response.data.product
	},

	async removeFromShop(
		productId: number,
		shopId: number,
	): Promise<{ shop_id: number; product_id: number }> {
		const response = await api.delete<{ shop_id: number; product_id: number }>(
			`/api/v1/shops/${shopId}/products/${productId}`,
		)
		return response.data
	},

	async getProductsByShop(shopId: number): Promise<ProductCard[]> {
		const allProducts = await api.get<{ items: ProductCard[] }>(
			'/api/products?limit=100',
		)
		return allProducts.data.items.filter(
			(p: ProductCard & { shop_ids?: number[] }) =>
				p.shop_ids?.includes(shopId),
		)
	},
}
