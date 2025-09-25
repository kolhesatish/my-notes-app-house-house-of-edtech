import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (request.nextUrl.pathname.startsWith('/notes')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    try {
      const verifiedToken = await verifyAuth(token.value);
      if (!verifiedToken) {
        throw new Error('Invalid token');
      }

      // Add user info to headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', verifiedToken.userId as string);

      return NextResponse.next({
        headers: requestHeaders,
      });
    } catch {
      // Token verification failed
      const url = new URL('/login', request.url);
      url.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/notes/:path*',
    '/api/notes/:path*',
  ]
}
