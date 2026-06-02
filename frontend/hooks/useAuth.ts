import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../services/auth.service';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setSession, clearSession, setLoading } =
    useAuthStore();

  const login = async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setSession(response.user, response.token.access_token);
      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message = axiosError.response?.data?.detail || 'Ошибка авторизации';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      setSession(response.user, response.token.access_token);
      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message = axiosError.response?.data?.detail || 'Ошибка регистрации';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}
