import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token') ?? req.cookies.get('__Secure-next-auth.session-token');
  const isLoginPage = req.nextUrl.pathname === '/login';
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)'],
};
