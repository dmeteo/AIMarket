import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  { path: '/profile', roles: ['BUYER', 'SELLER', 'ADMIN', 'MODERATOR'] },
  { path: '/checkout', roles: ['BUYER', 'SELLER'] },
  { path: '/cart', roles: ['BUYER', 'SELLER'] },
];

const adminRoutes = [
  { path: '/admin', roles: ['ADMIN'] },
];

const sellerRoutes = [
  { path: '/seller', roles: ['SELLER'] },
];

const guestOnlyRoutes = ['/login', '/register'];

function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('auth_token')?.value ?? null;
}

function getUserFromRequest(request: NextRequest): { role: string } | null {
  const userCookie = request.cookies.get('auth_user')?.value;
  if (!userCookie) return null;
  try {
    return JSON.parse(decodeURIComponent(userCookie));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const token = getTokenFromRequest(request);
  const user = getUserFromRequest(request);
  const isAuthenticated = !!token && !!user;

  console.log(`[MW] ${pathname} | token: ${!!token} | user: ${user?.role ?? 'none'} | auth: ${isAuthenticated}`);

  // Redirect authenticated users away from guest-only routes
  if (isAuthenticated && guestOnlyRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`[MW] Redirect: ${pathname} -> / (guest-only, already auth)`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin routes (except login page)
  if (adminRoutes.some((route) => pathname.startsWith(route.path)) && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      console.log(`[MW] Redirect: ${pathname} -> /admin/login (not authenticated)`);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (!adminRoutes.some((route) => route.roles.includes(user!.role))) {
      console.log(`[MW] Redirect: ${pathname} -> / (role ${user!.role} not ADMIN)`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect seller routes
  if (sellerRoutes.some((route) => pathname.startsWith(route.path))) {
    if (!isAuthenticated) {
      console.log(`[MW] Redirect: ${pathname} -> /login (not authenticated)`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!sellerRoutes.some((route) => route.roles.includes(user!.role))) {
      console.log(`[MW] Redirect: ${pathname} -> / (role ${user!.role} not SELLER)`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect general authenticated routes
  if (protectedRoutes.some((route) => pathname.startsWith(route.path))) {
    if (!isAuthenticated) {
      console.log(`[MW] Redirect: ${pathname} -> /login (not authenticated)`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log(`[MW] Allow: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/checkout/:path*',
    '/cart/:path*',
    '/admin/:path*',
    '/seller/:path*',
    '/login',
    '/register',
    '/about',
  ],
};
