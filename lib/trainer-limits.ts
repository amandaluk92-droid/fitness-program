import { prisma } from '@/lib/prisma'
import { getMaxTrainees } from '@/lib/subscription-tiers'
import type { SubscriptionTier } from '@prisma/client'

/** When true, trainers can add trainees without a subscription (deploy without Stripe). */
export function isPaymentsDisabled(): boolean {
  return process.env.DISABLE_PAYMENTS === 'true'
}

export async function getTrainerActiveSubscription(trainerId: string) {
  if (isPaymentsDisabled()) {
    return null // No real subscription required; canTrainerAddTrainee will bypass
  }

  const subscription = await prisma.trainerSubscription.findFirst({
    where: {
      trainerId,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) return null

  // Expired free trial: check both trialExpiresAt and endDate
  const trialExpired =
    subscription.tier === 'FREE_TRIAL' &&
    ((subscription.trialExpiresAt && subscription.trialExpiresAt < new Date()) ||
     (subscription.endDate && subscription.endDate < new Date()))

  if (trialExpired) {
    await prisma.$transaction([
      prisma.trainerSubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      }),
      prisma.trainingProgram.updateMany({
        where: { trainerId },
        data: { isActive: false },
      }),
    ])
    return null
  }

  return subscription
}

export async function getTrainerTraineeCount(trainerId: string): Promise<number> {
  const result = await prisma.programAssignment.findMany({
    where: {
      program: { trainerId },
    },
    select: { traineeId: true },
    distinct: ['traineeId'],
  })
  return result.length
}

export interface CanAddTraineeResult {
  allowed: boolean
  currentCount: number
  maxTrainees: number
  subscription: Awaited<ReturnType<typeof getTrainerActiveSubscription>>
}

export async function canTrainerAddTrainee(
  trainerId: string,
  traineeId?: string
): Promise<CanAddTraineeResult> {
  if (isPaymentsDisabled()) {
    const currentCount = await getTrainerTraineeCount(trainerId)
    return {
      allowed: true,
      currentCount,
      maxTrainees: 999,
      subscription: null,
    }
  }

  // Use a serializable transaction to prevent TOCTOU race conditions
  // when multiple concurrent requests try to add trainees
  return prisma.$transaction(async (tx) => {
    const subscription = await getTrainerActiveSubscription(trainerId)

    if (!subscription) {
      const currentCount = await getTrainerTraineeCountTx(tx, trainerId)
      return {
        allowed: false,
        currentCount,
        maxTrainees: 0,
        subscription: null,
      }
    }

    const maxTrainees = getMaxTrainees(subscription.tier as SubscriptionTier)
    const currentCount = await getTrainerTraineeCountTx(tx, trainerId)

    // If trainee already has a program from this trainer, no additional slot used
    if (traineeId) {
      const traineeAlreadyAssigned = await tx.programAssignment.findFirst({
        where: {
          traineeId,
          program: { trainerId },
        },
      })

      if (traineeAlreadyAssigned) {
        return {
          allowed: true,
          currentCount,
          maxTrainees,
          subscription,
        }
      }
    }

    const allowed = currentCount < maxTrainees

    return {
      allowed,
      currentCount,
      maxTrainees,
      subscription,
    }
  }, { isolationLevel: 'Serializable' })
}

/** Transaction-aware version of getTrainerTraineeCount */
async function getTrainerTraineeCountTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  trainerId: string
): Promise<number> {
  const result = await tx.programAssignment.findMany({
    where: {
      program: { trainerId },
    },
    select: { traineeId: true },
    distinct: ['traineeId'],
  })
  return result.length
}
