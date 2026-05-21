import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/core/constants/roles';
import { ENV } from '@/core/config/env';

const BACKEND_URL = ENV.BACKEND_URL;
const INTERNAL_PROXY_SECRET = ENV.INTERNAL_PROXY_SECRET;
const PUBLIC_PATH_PREFIXES = ['/pay', '/checkout'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isPublicPath) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get('session_id')?.value;

  // 1. Check for session existence
  if (!sessionId) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. For admin routes, verify role from backend using session id.
  let sessionRole: string | null = null;
  if (pathname.startsWith('/admin')) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'X-Session-Id': sessionId,
          ...(INTERNAL_PROXY_SECRET ? { 'X-Internal-Proxy-Secret': INTERNAL_PROXY_SECRET } : {}),
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const payload = await response.json();
      sessionRole = payload?.data?.user?.role || payload?.user?.role || null;
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Role-based Access Control
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Checking admin access for ${sessionRole}`);
    if (sessionRole !== UserRole.ADMIN) {
      console.log(`[Middleware] Access denied. Session role: ${sessionRole}, Required: ${UserRole.ADMIN}`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.log('[Middleware] Admin access granted');
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pay/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/wallets/:path*',
    '/payments/:path*',
    '/merchant/:path*',
  ],
};
