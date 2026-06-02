import api from '../lib/api';

// ---- Types (from OpenAPI) ----

export type Role = 'BUYER' | 'SELLER' | 'ADMIN' | 'MODERATOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  orders_count: number;
}

export interface AuthResponse {
  user: CurrentUserResponse;
  token: TokenResponse;
}

// ---- API calls ----

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  async me(): Promise<CurrentUserResponse> {
    const response = await api.get<CurrentUserResponse>('/api/v1/users/me');
    return response.data;
  },
};
