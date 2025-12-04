import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register']
  
  // Protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/attendance', 
    '/sales',
    '/expenses',
    '/payroll',
    '/savings',
    '/reports',
    '/users',
    '/profile',
    '/profit-allocation'
  ]

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path))
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // Check for session cookie
    const session = request.cookies.get('session')
    
    if (!session) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    try {
      // Validate session data
      const sessionData = JSON.parse(session.value)
      if (!sessionData.userId || !sessionData.role) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Error parsing session data:', error)
      // Invalid session format
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}