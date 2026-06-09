const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Try localStorage first, then cookies
  const lsToken = localStorage.getItem(TOKEN_KEY);
  if (lsToken) return lsToken;
  // Fallback to cookies
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  // Also set cookie for middleware
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800`;
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  // Clear cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function getUser<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null;
  // Try localStorage first
  const lsRaw = localStorage.getItem(USER_KEY);
  if (lsRaw) {
    try { return JSON.parse(lsRaw) as T; } catch { /* ignore */ }
  }
  // Fallback to cookies
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${USER_KEY}=([^;]*)`));
  if (match) {
    try { return JSON.parse(decodeURIComponent(match[1])) as T; } catch { /* ignore */ }
  }
  return null;
}

export function setUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also set cookie for middleware
  document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800`;
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
  // Clear cookie
  document.cookie = `${USER_KEY}=; path=/; max-age=0`;
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}
