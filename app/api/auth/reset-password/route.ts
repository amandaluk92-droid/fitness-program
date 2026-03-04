import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePasswordResetToken } from '@/lib/tokens'
import { checkRateLimit, AUTH_RATE_LIMIT, getClientIp } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rateLimitResult = checkRateLimit(`reset-password:${ip}`, AUTH_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfterSeconds.toString() } }
      )
    }

    const body = await request.json()
    const { token, password } = schema.parse(body)

    const userId = await validatePasswordResetToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
