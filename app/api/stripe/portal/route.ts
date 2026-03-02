import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getStripeConfig } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { isPaymentsDisabled } from '@/lib/trainer-limits'

export async function POST() {
  try {
    if (isPaymentsDisabled()) {
      return NextResponse.json(
        { error: 'Payments are temporarily disabled' },
        { status: 503 }
      )
    }

    const session = await getSession()
    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stripe } = await getStripeConfig()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const subscription = await prisma.trainerSubscription.findFirst({
      where: {
        trainerId: session.user.id,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/trainer/subscription`,
    })

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
