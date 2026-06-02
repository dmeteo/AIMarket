import { http, HttpResponse } from 'msw';
import products from './data/products.json';
import { authHandlers } from './handlers/auth';

export const handlers = [
  // Auth handlers
  ...authHandlers,

  // Root
  http.get('/', () => {
    return HttpResponse.json(
      { status: 'ok', message: 'Mock API is running' },
      { status: 200 }
    );
  }),

  // Products
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
];
