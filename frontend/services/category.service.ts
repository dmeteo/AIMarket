import api from '../lib/api';

export interface Category {
  id: number;
  title: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/v1/categories/');
    return response.data;
  },
};
