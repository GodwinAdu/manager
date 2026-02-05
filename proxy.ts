import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register']
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname === path)
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // All other paths require authentication
  const token = request.cookies.get('authToken')
  
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}