import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailNotifications: true },
  })

  return NextResponse.json({ emailNotifications: user?.emailNotifications ?? true })
}

const patchSchema = z.object({
  emailNotifications: z.boolean(),
})

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { emailNotifications } = patchSchema.parse(body)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailNotifications },
    })

    return NextResponse.json({ emailNotifications })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
