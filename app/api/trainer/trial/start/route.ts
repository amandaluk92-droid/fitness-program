import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTrainerActiveSubscription } from '@/lib/trainer-limits'

const TRIAL_DAYS = 14

export async function POST() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainerId = session.user.id

    const activeSubscription = await getTrainerActiveSubscription(trainerId)
    if (activeSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription.' },
        { status: 400 }
      )
    }

    const everHadTrial = await prisma.trainerSubscription.findFirst({
      where: {
        trainerId,
        tier: 'FREE_TRIAL',
      },
    })
    if (everHadTrial) {
      return NextResponse.json(
        { error: 'Free trial is available only once per trainer.' },
        { status: 400 }
      )
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + TRIAL_DAYS)

    const subscription = await prisma.trainerSubscription.create({
      data: {
        trainerId,
        tier: 'FREE_TRIAL',
        status: 'ACTIVE',
        amount: 0,
        currency: 'HKD',
        billingInterval: 'MONTHLY',
        startDate,
        endDate,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      },
    })

    return NextResponse.json(
      {
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error starting free trial:', error)
    return NextResponse.json(
      { error: 'Failed to start free trial' },
      { status: 500 }
    )
  }
}
