import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit, AUTH_RATE_LIMIT, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = checkRateLimit(`forgot-password:${ip}`, AUTH_RATE_LIMIT)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    // Always return same response to prevent email enumeration
    const successResponse = NextResponse.json({ success: true })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return successResponse

    const rawToken = await generatePasswordResetToken(user.id)

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      userName: user.name,
    })

    return successResponse
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
