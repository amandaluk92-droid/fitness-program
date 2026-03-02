import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { BillingInterval } from '@prisma/client'
import { getStripeConfig } from '@/lib/stripe'
import { isPaymentsDisabled } from '@/lib/trainer-limits'
import { prisma } from '@/lib/prisma'
import {
  TIER_METADATA,
  getDiscountedMonthlyPrice,
  type BillingIntervalDisplay,
} from '@/lib/subscription-tiers'

function stripeIntervalToBillingInterval(
  interval: string,
  intervalCount: number
): BillingInterval {
  if (interval === 'year' || (interval === 'month' && intervalCount === 12)) {
    return 'ANNUAL'
  }
  if (interval === 'month' && intervalCount === 6) {
    return 'SEMI_ANNUAL'
  }
  return 'MONTHLY'
}

function toDisplayInterval(b: BillingInterval): BillingIntervalDisplay {
  if (b === 'ANNUAL') return 'ANNUAL'
  if (b === 'SEMI_ANNUAL') return 'SEMI_ANNUAL'
  return 'MONTHLY'
}

export async function POST(request: NextRequest) {
  if (isPaymentsDisabled()) {
    return NextResponse.json(
      { error: 'Payments are temporarily disabled' },
      { status: 503 }
    )
  }

  const { stripe, webhookSecret } = await getStripeConfig()
  if (!stripe || !webhookSecret) {
    console.error('Stripe or webhook secret not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id
          const customerId =
            typeof session.customer === 'string'
              ? session.customer
              : session.customer.id
          const trainerId = session.metadata?.trainerId
          const tier = session.metadata?.tier as
            | 'STARTER'
            | 'GROWTH'
            | 'STUDIO'
            | 'PRO'
            | undefined
          const intervalFromMeta = session.metadata?.interval as
            | 'MONTHLY'
            | 'SEMI_ANNUAL'
            | 'ANNUAL'
            | undefined

          if (!trainerId || !tier) {
            console.error('Missing trainerId or tier in checkout metadata')
            break
          }

          const intervalDisplay: BillingIntervalDisplay =
            intervalFromMeta ?? 'MONTHLY'
          const billingInterval: BillingInterval =
            intervalDisplay === 'ANNUAL'
              ? 'ANNUAL'
              : intervalDisplay === 'SEMI_ANNUAL'
                ? 'SEMI_ANNUAL'
                : 'MONTHLY'
          const metadata = TIER_METADATA.find((m) => m.tier === tier)
          const priceMonthly = metadata?.priceMonthly ?? 0
          const amount = getDiscountedMonthlyPrice(priceMonthly, intervalDisplay)

          await prisma.trainerSubscription.create({
            data: {
              trainerId,
              tier,
              status: 'ACTIVE',
              amount,
              currency: 'HKD',
              billingInterval,
              startDate: new Date(),
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
            },
          })
          // Payment record created by invoice.paid webhook
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const trainerId = sub.metadata?.trainerId
        const tier = sub.metadata?.tier as
          | 'STARTER'
          | 'GROWTH'
          | 'STUDIO'
          | 'PRO'
          | undefined

        if (!trainerId || !tier) break

        const item = sub.items?.data?.[0]
        const recurring = item?.price?.recurring
        const interval = recurring?.interval ?? 'month'
        const intervalCount = recurring?.interval_count ?? 1
        const billingInterval = stripeIntervalToBillingInterval(
          interval,
          intervalCount
        )
        const metadata = TIER_METADATA.find((m) => m.tier === tier)
        const priceMonthly = metadata?.priceMonthly ?? 0
        const amount = getDiscountedMonthlyPrice(
          priceMonthly,
          toDisplayInterval(billingInterval)
        )

        await prisma.trainerSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            tier,
            billingInterval,
            status:
              sub.status === 'active'
                ? 'ACTIVE'
                : sub.status === 'past_due'
                  ? 'PAST_DUE'
                  : sub.status === 'canceled' || sub.status === 'unpaid'
                    ? 'CANCELLED'
                    : 'ACTIVE',
            amount,
            endDate: sub.cancel_at
              ? new Date(sub.cancel_at * 1000)
              : sub.ended_at
                ? new Date(sub.ended_at * 1000)
                : null,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.trainerSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'CANCELLED', endDate: new Date() },
        })
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason === 'subscription_cycle' && invoice.customer) {
          const customerId =
            typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer.id
          const subscription = await prisma.trainerSubscription.findFirst({
            where: { stripeCustomerId: customerId, status: 'ACTIVE' },
          })
          if (subscription) {
            await prisma.payment.create({
              data: {
                userId: subscription.trainerId,
                amount: (invoice.amount_paid ?? 0) / 100,
                currency: (invoice.currency ?? 'hkd').toUpperCase(),
                status: 'COMPLETED',
                description: `Subscription renewal - ${subscription.tier}`,
                stripePaymentId: (() => {
                  const pi = (invoice as { payment_intent?: string | { toString(): string } })
                    .payment_intent
                  return pi != null ? (typeof pi === 'string' ? pi : String(pi)) : undefined
                })(),
              },
            })
          }
        }
        break
      }

      default:
        break
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
