import { http, HttpResponse } from 'msw'
import products from '../data/products.json'

interface CartItem {
	product_id: number
	quantity: number
	price: string
	final_price: string
	title: string
	image: string
}

interface CartState {
	id: number
	user_id: number
	items: CartItem[]
	total_price: string
	total_discount: string
	final_price: string
}

// In-memory cart (per user — simplified to single user for mock)
const cart: CartState = {
	id: 1,
	user_id: 1,
	items: [],
	total_price: '0',
	total_discount: '0',
	final_price: '0',
}

function findProduct(id: number) {
	return products.items.find(p => p.id === id)
}

function recalcTotals() {
	let total = 0
	let totalDiscount = 0
	for (const item of cart.items) {
		const price = parseFloat(item.price)
		const finalPrice = parseFloat(item.final_price)
		total += price * item.quantity
		totalDiscount += (price - finalPrice) * item.quantity
	}
	cart.total_price = total.toFixed(2)
	cart.total_discount = totalDiscount.toFixed(2)
	cart.final_price = (total - totalDiscount).toFixed(2)
}

export const cartHandlers = [
	// GET /api/v1/cart/ — get current cart
	http.get('/api/v1/cart/', () => {
		return HttpResponse.json({ cart })
	}),

	// POST /api/v1/cart/items — add item to cart
	http.post('/api/v1/cart/items', async ({ request }) => {
		const body = (await request.json()) as {
			product_id?: number
			quantity?: number
		}

		if (!body.product_id || !body.quantity) {
			return HttpResponse.json(
				{ detail: 'product_id и quantity обязательны' },
				{ status: 422 },
			)
		}

		const product = findProduct(body.product_id)
		if (!product) {
			return HttpResponse.json({ detail: 'Товар не найден' }, { status: 404 })
		}

		const existing = cart.items.find(i => i.product_id === body.product_id)
		if (existing) {
			existing.quantity += body.quantity
		} else {
			cart.items.push({
				product_id: product.id,
				quantity: body.quantity,
				price: product.price,
				final_price: product.final_price,
				title: product.title,
				image: product.images?.[0] || '/placeholder.svg',
			})
		}

		recalcTotals()
		return HttpResponse.json({ cart })
	}),

	// PATCH /api/v1/cart/items/:product_id — update quantity
	http.patch('/api/v1/cart/items/:product_id', async ({ request, params }) => {
		const productId = parseInt(params.product_id as string, 10)
		const body = (await request.json()) as { quantity?: number }

		if (!body.quantity || body.quantity < 1) {
			return HttpResponse.json(
				{ detail: 'quantity должен быть >= 1' },
				{ status: 422 },
			)
		}

		const item = cart.items.find(i => i.product_id === productId)
		if (!item) {
			return HttpResponse.json(
				{ detail: 'Товар не найден в корзине' },
				{ status: 404 },
			)
		}

		item.quantity = body.quantity
		recalcTotals()
		return HttpResponse.json({ cart })
	}),

	// DELETE /api/v1/cart/items/:product_id — remove item
	http.delete('/api/v1/cart/items/:product_id', ({ params }) => {
		const productId = parseInt(params.product_id as string, 10)
		cart.items = cart.items.filter(i => i.product_id !== productId)
		recalcTotals()
		return HttpResponse.json({ cart })
	}),
]
