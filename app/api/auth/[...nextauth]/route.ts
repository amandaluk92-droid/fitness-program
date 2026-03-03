import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, AUTH_RATE_LIMIT, getClientIp } from '@/lib/rate-limit'

const handler = NextAuth(authOptions)

export { handler as GET }

export async function POST(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params
  const isCredentialsCallback =
    params.nextauth?.includes('callback') && params.nextauth?.includes('credentials')

  if (isCredentialsCallback) {
    const ip = getClientIp(request.headers)
    const result = checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT)

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfterSeconds) },
        }
      )
    }
  }

  return handler(request, { params: Promise.resolve({ nextauth: params.nextauth }) }) as Promise<Response>
}
