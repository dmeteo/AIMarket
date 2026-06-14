import { http, HttpResponse } from 'msw';
import products from './data/products.json';
import { authHandlers } from './handlers/auth';
import { cartHandlers } from './handlers/cart';
import { orderHandlers } from './handlers/orders';
import { sellerHandlers } from './handlers/seller';
import { productHandlers } from './handlers/products';
import { categoryHandlers } from './handlers/categories';
import { brandHandlers } from './handlers/brands';
import { reviewHandlers } from './handlers/reviews';
import { analyticsHandlers } from './handlers/analytics';
import { uploadHandlers } from './handlers/upload';

export const handlers = [
  // Auth handlers
  ...authHandlers,

  // Cart handlers
  ...cartHandlers,

  // Order handlers
  ...orderHandlers,

  // Seller handlers (shops CRUD, applications, orders)
  ...sellerHandlers,

  // Products CRUD + assign
  ...productHandlers,

  // Categories
  ...categoryHandlers,

  // Brands
  ...brandHandlers,

  // Reviews
  ...reviewHandlers,

  // Analytics
  ...analyticsHandlers,

  // Upload
  ...uploadHandlers,

  // Root
  http.get('/', () => {
    return HttpResponse.json(
      { status: 'ok', message: 'Mock API is running' },
      { status: 200 }
    );
  }),

  // Products list (legacy path — kept for backward compat)
  http.get('/api/products', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = products.items.slice(start, end);
    return HttpResponse.json({
      items: paginatedItems,
      hasNextPage: end < products.items.length,
    });
  }),

  // Single product by ID (keep for storefront)
  http.get('/api/v1/products/:product_id', (req) => {
    const id = parseInt(req.params.product_id as string, 10);
    const product = products.items.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json(
        { detail: 'Товар не найден' },
        { status: 404 }
      );
    }
    return HttpResponse.json(product);
  }),
];
