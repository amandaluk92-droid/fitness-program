import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getStripeConfig } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { isPaymentsDisabled } from '@/lib/trainer-limits'
import { z } from 'zod'

const bodySchema = z.object({
  tier: z.enum(['STARTER', 'GROWTH', 'STUDIO', 'PRO']),
  interval: z.enum(['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL']).default('MONTHLY'),
})

export async function POST(request: NextRequest) {
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

    const { stripe, getPriceIdForTierAndInterval } = await getStripeConfig()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { tier, interval } = bodySchema.parse(body)

    const priceId = getPriceIdForTierAndInterval(tier, interval)
    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for tier: ${tier}, interval: ${interval}` },
        { status: 400 }
      )
    }

    const trainer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/trainer/subscription?success=true`,
      cancel_url: `${baseUrl}/trainer/subscription?canceled=true`,
      customer_email: trainer.email,
      metadata: {
        trainerId: session.user.id,
        tier,
        interval,
      },
      subscription_data: {
        metadata: {
          trainerId: session.user.id,
          tier,
          interval,
        },
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
