import { http, HttpResponse } from 'msw';
import brandsData from '../data/brands.json';

export const brandHandlers = [
  // GET /api/v1/brands/
  http.get('/api/v1/brands/', () => {
    return HttpResponse.json((brandsData as { brands: unknown[] }).brands);
  }),
];
