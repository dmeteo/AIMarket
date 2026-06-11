import { http, HttpResponse } from 'msw';
import reviewsData from '../data/reviews.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReviewItem = any;

function findReviewIndex(productId: number, reviewId: number): number {
  return (reviewsData as { reviews: ReviewItem[] }).reviews.findIndex(
    (r) => r.product_id === productId && r.id === reviewId,
  );
}

function getReviewsByProduct(productId: number): ReviewItem[] {
  return (reviewsData as { reviews: ReviewItem[] }).reviews.filter(
    (r) => r.product_id === productId,
  );
}

export const reviewHandlers = [
  // GET /api/v1/products/{product_id}/reviews
  http.get('/api/v1/products/:product_id/reviews', ({ params }) => {
    const productId = parseInt(params.product_id as string, 10);
    const reviews = getReviewsByProduct(productId);
    return HttpResponse.json({ reviews });
  }),

  // POST /api/v1/products/{product_id}/reviews
  http.post('/api/v1/products/:product_id/reviews', async ({ request, params }) => {
    const productId = parseInt(params.product_id as string, 10);
    const body = (await request.json()) as { rate?: number; text?: string };

    if (!body.rate || body.rate < 1 || body.rate > 5) {
      return HttpResponse.json({ rate: [body.rate], text: [body.text] }, { status: 422 });
    }

    const newId = Math.max(...(reviewsData as { reviews: ReviewItem[] }).reviews.map((r) => r.id), 0) + 1;
    const now = new Date().toISOString();

    const newReview = {
      id: newId,
      user_id: 1,
      user_name: 'Текущий пользователь',
      product_id: productId,
      rate: body.rate,
      text: body.text || null,
      created_at: now,
      edited: false,
      edited_at: null,
    };

    (reviewsData as { reviews: ReviewItem[] }).reviews.push(newReview);
    return HttpResponse.json({ review: newReview });
  }),

  // PATCH /api/v1/products/{product_id}/reviews/{review_id}
  http.patch('/api/v1/products/:product_id/reviews/:review_id', async ({ request, params }) => {
    const productId = parseInt(params.product_id as string, 10);
    const reviewId = parseInt(params.review_id as string, 10);
    const index = findReviewIndex(productId, reviewId);

    if (index === -1) {
      return HttpResponse.json({ detail: 'Отзыв не найден' }, { status: 404 });
    }

    const body = (await request.json()) as { rate?: number; text?: string };
    const review = (reviewsData as { reviews: ReviewItem[] }).reviews[index];

    if (body.rate !== undefined) review.rate = body.rate;
    if (body.text !== undefined) review.text = body.text;
    review.edited = true;
    review.edited_at = new Date().toISOString();

    return HttpResponse.json(review);
  }),

  // DELETE /api/v1/products/{product_id}/reviews/{review_id}
  http.delete('/api/v1/products/:product_id/reviews/:review_id', ({ params }) => {
    const productId = parseInt(params.product_id as string, 10);
    const reviewId = parseInt(params.review_id as string, 10);
    const index = findReviewIndex(productId, reviewId);

    if (index === -1) {
      return HttpResponse.json({ detail: 'Отзыв не найден' }, { status: 404 });
    }

    (reviewsData as { reviews: ReviewItem[] }).reviews.splice(index, 1);
    return HttpResponse.json({ review_id: reviewId });
  }),
];
