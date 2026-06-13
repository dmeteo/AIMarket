import api from '../lib/api'

// CartItem для API ответов (отличается от store/cart.store CartItem)
export interface CartItem {
	product_id: number
	quantity: number
	price?: string
	final_price?: string
	title?: string
	image?: string
}

export interface AddToCartRequest {
	product_id: number
	quantity: number
}

export interface UpdateCartItemRequest {
	product_id: number
	quantity: number
}

// POST /api/v1/cart/items — ответ { cart_id }
export interface AddToCartResponse {
	cart_id: number
}

// PATCH /api/v1/cart/items/:product_id — ответ { product_id, quantity }
export interface UpdateCartItemResponse {
	product_id: number
	quantity: number
}

// GET /api/v1/cart/ — полная корзина
export interface CartResponse {
	id: number
	user_id: number
	items: CartItem[]
	total_price: string
	total_discount: string
	final_price: string
}

export const cartService = {
	async getCart(): Promise<CartResponse> {
		const response = await api.get<CartResponse>('/api/v1/cart/')
		return response.data
	},

	async addToCart(data: AddToCartRequest): Promise<AddToCartResponse> {
		const response = await api.post<AddToCartResponse>(
			'/api/v1/cart/items',
			data,
		)
		return response.data
	},

	async updateCartItem(
		productId: number,
		quantity: number,
	): Promise<UpdateCartItemResponse> {
		const response = await api.patch<UpdateCartItemResponse>(
			`/api/v1/cart/items/${productId}`,
			{ product_id: productId, quantity },
		)
		return response.data
	},

	async removeFromCart(productId: number): Promise<UpdateCartItemResponse> {
		const response = await api.delete<UpdateCartItemResponse>(
			`/api/v1/cart/items/${productId}`,
		)
		return response.data
	},
}
