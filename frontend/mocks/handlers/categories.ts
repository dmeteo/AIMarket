import { http, HttpResponse } from 'msw';
import categoriesData from '../data/categories.json';

export const categoryHandlers = [
  // GET /api/v1/categories/
  http.get('/api/v1/categories/', () => {
    return HttpResponse.json((categoriesData as { categories: unknown[] }).categories);
  }),
];
