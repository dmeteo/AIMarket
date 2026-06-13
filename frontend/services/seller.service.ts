import api from '../lib/api'

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface SellerData {
	name: string
	email: string
	phone: string
	about: string
}

export interface LegalData {
	entityType: string
	inn: string
	ogrn: string
	legalAddress: string
	bankBik: string
	bankAccount: string
}

export interface SellerApplication {
	id: number
	userId: number
	status: ApplicationStatus
	// Flat fields from ApplicationToBeSellerRequest
	full_name: string
	email: string
	phone: string
	description: string
	person_type: string
	inn: string
	ogrn: string
	address: string
	bic: string
	checking_account: string
	// Nested fields for backward compatibility
	sellerData: SellerData
	legalData: LegalData
	rejectionReason: string | null | undefined
	createdAt: string
	updatedAt: string
}

export type PersonType = 'INDIVIDUAL_EMPLOYER' | 'SELF_EMPLOYED' | 'OOO'

export interface CreateApplicationRequest {
	full_name: string
	email: string
	phone: string
	description: string
	person_type: PersonType
	inn: string
	ogrn: string
	address: string
	bic: string
	checking_account: string
}

export interface SellerShop {
	id: number
	seller_id: number
	title: string // было name — OpenAPI ожидает title
	description: string
	logo_url: string | null
	products_count: number
	orders_count: number
	revenue: number
	is_active: boolean
	created_at: string
}

export interface SellerOrder {
	id: number
	items: Array<{
		product: {
			id: number
			title: string
		}
		quantity: number
	}>
	total_price: string
	status: { code: string; label: string }
	createdAt: string
}

export const sellerService = {
	// Applications
	async getApplications(): Promise<SellerApplication[]> {
		const response = await api.get<SellerApplication[]>(
			'/api/v1/admin/applications_to_seller',
		)
		return response.data
	},

	async getApplication(id: number): Promise<SellerApplication> {
		const response = await api.get<SellerApplication>(
			`/api/v1/admin/applications_to_seller/${id}`,
		)
		return response.data
	},

	async createApplication(
		data: CreateApplicationRequest,
	): Promise<SellerApplication> {
		const response = await api.post<SellerApplication>(
			'/api/v1/users/seller_application',
			data,
		)
		return response.data
	},

	async approveApplication(id: number): Promise<SellerApplication> {
		const response = await api.patch<SellerApplication>(
			`/api/v1/admin/applications_to_seller/${id}/approve`,
		)
		return response.data
	},

	async rejectApplication(
		id: number,
		reason: string,
	): Promise<SellerApplication> {
		const response = await api.patch<SellerApplication>(
			`/api/v1/admin/applications_to_seller/${id}/reject`,
			{ reason },
		)
		return response.data
	},

	async getMyApplication(userId: number): Promise<SellerApplication | null> {
		try {
			const response = await api.get<SellerApplication[]>(
				'/api/v1/seller-applications',
				{ params: { userId } },
			)
			return response.data[0] ?? null
		} catch {
			return null
		}
	},

	// Shops CRUD
	async getSellerShops(sellerId: number): Promise<SellerShop[]> {
		const response = await api.get<SellerShop[]>(
			`/api/v1/seller/${sellerId}/shops`,
		)
		return response.data
	},

	async getShop(shopId: number): Promise<SellerShop> {
		const response = await api.get<SellerShop>(`/api/v1/shops/${shopId}`)
		return response.data
	},

	async createShop(data: {
		title: string
		description?: string
		logo_url?: string
	}): Promise<SellerShop> {
		const response = await api.post<SellerShop>('/api/v1/shops/', data)
		return response.data
	},

	async updateShop(
		shopId: number,
		data: Partial<{
			title: string
			description: string
			logo_url: string
			is_active: boolean
		}>,
	): Promise<SellerShop> {
		const response = await api.patch<SellerShop>(
			`/api/v1/shops/${shopId}`,
			data,
		)
		return response.data
	},

	async deleteShop(shopId: number): Promise<{ id: number }> {
		const response = await api.delete<{ id: number }>(`/api/v1/shops/${shopId}`)
		return response.data
	},

	// Seller orders
	async getSellerOrders(sellerId: number): Promise<SellerOrder[]> {
		const response = await api.get<SellerOrder[]>(
			`/api/v1/seller/${sellerId}/orders`,
		)
		return response.data
	},

	// Seller products (across all shops)
	async getSellerProducts(sellerId: number): Promise<unknown[]> {
		const response = await api.get<unknown[]>(
			`/api/v1/seller/${sellerId}/products`,
		)
		return response.data
	},
}
