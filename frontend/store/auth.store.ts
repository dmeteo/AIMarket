import { create } from 'zustand';
import type { CurrentUserResponse } from '../services/auth.service';
import { getToken, setToken, setUser, getUser, clearAuth } from '../lib/auth';

interface AuthState {
  user: CurrentUserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (user: CurrentUserResponse, token: string) => void;
  clearSession: () => void;
  restoreSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setSession: (user, token) => {
    setToken(token);
    setUser(user);
    set({ user, token, isAuthenticated: true });
  },

  clearSession: () => {
    clearAuth();
    set({ user: null, token: null, isAuthenticated: false });
  },

  restoreSession: () => {
    const token = getToken();
    const user = getUser<CurrentUserResponse>();
    if (token && user) {
      set({ user, token, isAuthenticated: true });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
