import api from '../lib/api';

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rate: number;
  text: string | null;
  created_at: string;
  edited: boolean;
  edited_at: string | null;
}

export interface ReviewsResponse {
  reviews: Review[];
}

export const reviewService = {
  async getReviews(productId: number): Promise<Review[]> {
    const response = await api.get<ReviewsResponse>(`/api/v1/products/${productId}/reviews`);
    return response.data.reviews;
  },

  async createReview(productId: number, data: { rate: number; text?: string }): Promise<Review> {
    const response = await api.post<{ review: Review }>(`/api/v1/products/${productId}/reviews`, data);
    return response.data.review;
  },

  async updateReview(productId: number, reviewId: number, data: { rate?: number; text?: string }): Promise<Review> {
    const response = await api.patch<Review>(`/api/v1/products/${productId}/reviews/${reviewId}`, data);
    return response.data;
  },

  async deleteReview(productId: number, reviewId: number): Promise<{ review_id: number }> {
    const response = await api.delete<{ review_id: number }>(`/api/v1/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },
};
