import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getCookies } from '@/services/sessionManager';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userData = await getCookies();

  if (!userData && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (userData && (pathname.endsWith('/') || pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/agenda', request.url));
  }

  return;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|sitemap.xml|robots.txt).*)']
};

// deploy commit test - remove this line
