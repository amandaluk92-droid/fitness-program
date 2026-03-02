import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({
  extendDays: z.number().int().min(1).max(365),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const { id } = await params
    const body = await request.json()
    const { extendDays } = bodySchema.parse(body)

    const subscription = await prisma.trainerSubscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (subscription.tier !== 'FREE_TRIAL') {
      return NextResponse.json(
        { error: 'Only free trial subscriptions can be extended' },
        { status: 400 }
      )
    }

    const currentEnd = subscription.endDate ?? new Date()
    const newEnd = new Date(currentEnd)
    newEnd.setDate(newEnd.getDate() + extendDays)

    const updated = await prisma.trainerSubscription.update({
      where: { id },
      data: { endDate: newEnd, updatedAt: new Date() },
    })

    return NextResponse.json({
      subscription: {
        id: updated.id,
        endDate: updated.endDate,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error extending trial:', error)
    return NextResponse.json(
      { error: 'Failed to extend trial' },
      { status: 500 }
    )
  }
}
