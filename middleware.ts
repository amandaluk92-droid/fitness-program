import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Demo mode: in dev or when ENABLE_DEMO_MODE is set, allow unauthenticated; in production require login unless demo enabled
const isDemoAllowed =
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEMO_MODE === 'true'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Root: if authenticated, redirect to dashboard by role; if not, allow through to show landing page
    if (path === '/') {
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      if (token?.role === 'TRAINER') {
        return NextResponse.redirect(new URL('/trainer/dashboard', req.url))
      }
      if (token?.role === 'TRAINEE') {
        return NextResponse.redirect(new URL('/trainee/dashboard', req.url))
      }
      // No token: show public landing page
      return NextResponse.next()
    }

    // Admin-only routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/trainee/dashboard', req.url))
    }
    // Role separation; without token redirect to login in production (or trainee dashboard in demo)
    if (path.startsWith('/trainer') && token?.role !== 'TRAINER') {
      return NextResponse.redirect(new URL('/trainee/dashboard', req.url))
    }
    if (path.startsWith('/trainee') && !token && !isDemoAllowed) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow unauthenticated access to root (landing page)
        if (req.nextUrl.pathname === '/') return true
        return isDemoAllowed || !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/trainer/:path*',
    '/trainee/:path*',
  ],
}
