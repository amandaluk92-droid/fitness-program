import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin, PROGRESS_PHOTOS_BUCKET } from '@/lib/supabase'
import { getStripeConfig } from '@/lib/stripe'
import { logAuditEvent } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const deleteSchema = z.object({
  confirmation: z.literal('DELETE'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { confirmation } = deleteSchema.parse(body)

    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation' }, { status: 400 })
    }

    const userId = session.user.id
    const ip = getClientIp(request.headers)

    // 1. Cancel active Stripe subscriptions if trainer
    if (session.user.role === 'TRAINER') {
      const subscriptions = await prisma.trainerSubscription.findMany({
        where: { trainerId: userId, status: 'ACTIVE' },
      })

      const { stripe } = await getStripeConfig()
      if (stripe) {
        for (const sub of subscriptions) {
          if (sub.stripeSubscriptionId) {
            try {
              await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
            } catch {
              // Subscription may already be cancelled in Stripe
            }
          }
        }
      }
    }

    // 2. Delete Supabase storage files (progress photos)
    const photos = await prisma.progressPhoto.findMany({
      where: { traineeId: userId },
      select: { photoUrl: true },
    })

    if (photos.length > 0) {
      const storagePaths = photos
        .map((p) => p.photoUrl)
        .filter((url) => !url.startsWith('http'))

      if (storagePaths.length > 0) {
        await supabaseAdmin.storage
          .from(PROGRESS_PHOTOS_BUCKET)
          .remove(storagePaths)
      }
    }

    // 3. Log audit event before deletion
    await logAuditEvent({
      userId,
      action: 'ACCOUNT_DELETE',
      resource: 'User',
      resourceId: userId,
      metadata: { email: session.user.email, role: session.user.role },
      ipAddress: ip,
    })

    // 4. Delete user — cascading deletes handle related records
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'You must type DELETE to confirm' }, { status: 400 })
    }
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
