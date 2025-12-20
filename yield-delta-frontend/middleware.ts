import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Handle docs subdomain
  if (hostname === 'docs.yielddelta.xyz' || hostname.startsWith('docs.')) {
    // If not already on /docs path, redirect to /docs
    if (!url.pathname.startsWith('/docs')) {
      url.pathname = `/docs${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Handle app subdomain (main application)
  if (hostname === 'app.yielddelta.xyz' || hostname.startsWith('app.')) {
    // If trying to access /docs, redirect to docs subdomain
    if (url.pathname.startsWith('/docs')) {
      return NextResponse.redirect(new URL(url.pathname, 'https://docs.yielddelta.xyz'))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}