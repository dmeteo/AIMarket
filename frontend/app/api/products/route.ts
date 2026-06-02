import { NextResponse } from 'next/server'
import productsData from '../../../mocks/data/products.json'

export async function GET(request: Request) {
	console.log('API Route: Handling /api/products request')

	// Parse pagination params (kept for compatibility)
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get('page') || '1', 10)
	const limit = parseInt(url.searchParams.get('limit') || '10', 10)

	console.log('API Route: Request params', { page, limit })

	// Use full list from mock JSON
	const allProducts = productsData.items

	// Apply pagination if needed, otherwise return all
	const start = (page - 1) * limit
	const end = start + limit
	const paginatedItems = allProducts.slice(start, end)

	const response = {
		items: paginatedItems,
		hasNextPage: end < allProducts.length,
	}

	console.log('API Route: Returning response', response)

	return NextResponse.json(response)
}
