import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const path = request.nextUrl.pathname;

  const isLoginPage = path === '/login';
  const isStorePage = path.startsWith('/store');
  const isStoreLoginPage = path === '/store/login';
  const isRootPage = path === '/';

  // If no auth token is present
  if (!token) {
    // Redirect all requests except admin login, store listing, store login, and root page to admin login
    if (!isLoginPage && !isStorePage && !isStoreLoginPage && !isRootPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // If auth token is present
  if (isLoginPage) {
    // Redirect back to dashboard if user is already logged in
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - schema.sql, db_schema_overview.md (documentation)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|schema.sql|db_schema_overview.md).*)',
  ],
};
