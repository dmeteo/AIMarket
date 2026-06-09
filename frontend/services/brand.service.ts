import api from '../lib/api';

export interface Brand {
  id: number;
  title: string;
  description: string | null;
  logo_url: string | null;
}

export const brandService = {
  async getBrands(): Promise<Brand[]> {
    const response = await api.get<Brand[]>('/api/v1/brands/');
    return response.data;
  },
};
