import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { PricingCards } from '@/components/trainer/PricingCards'
import { ManageBillingButton } from '@/components/trainer/ManageBillingButton'
import {
  getTrainerActiveSubscription,
  getTrainerTraineeCount,
  isPaymentsDisabled,
} from '@/lib/trainer-limits'
import { getMaxTrainees } from '@/lib/subscription-tiers'
import { TIER_METADATA } from '@/lib/subscription-tiers'
import { formatDate } from '@/lib/utils'
import { CreditCard } from 'lucide-react'

export default async function TrainerSubscriptionPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const trainerId = session.user.id
  const [subscription, traineeCount, usedFreeTrial] = await Promise.all([
    getTrainerActiveSubscription(trainerId),
    getTrainerTraineeCount(trainerId),
    prisma.trainerSubscription.findFirst({
      where: { trainerId, tier: 'FREE_TRIAL' },
    }),
  ])

  const paymentsDisabled = isPaymentsDisabled()
  const maxTrainees = subscription
    ? getMaxTrainees(subscription.tier)
    : 0
  const tierMeta = subscription
    ? TIER_METADATA.find((m) => m.tier === subscription.tier)
    : null
  const isFreeTrial = subscription?.tier === 'FREE_TRIAL'
  const t = await getTranslations('trainer.subscription')

  if (paymentsDisabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-8 w-8 text-primary-500" />
            <div>
              <p className="font-medium text-gray-900">Payments coming soon</p>
              <p className="text-sm text-gray-600">
                For now, you can add trainees and create programs without a subscription. Payment options will be available in a future update.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {subscription ? (
        <>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-8 w-8 text-primary-500" />
              <div>
                <p className="font-medium text-gray-900">
                  {tierMeta?.name ?? subscription.tier} Plan
                </p>
                <p className="text-sm text-gray-600">
                  {traineeCount} / {maxTrainees} trainees used
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-gray-900">{subscription.status}</p>
              </div>
              <div>
                <p className="text-gray-500">
                  {isFreeTrial ? 'Trial ends' : 'Next billing'}
                </p>
                <p className="font-medium text-gray-900">
                  {subscription.endDate
                    ? formatDate(subscription.endDate)
                    : subscription.billingInterval === 'SEMI_ANNUAL'
                      ? 'Every 6 months'
                      : subscription.billingInterval === 'ANNUAL'
                        ? 'Yearly'
                        : 'Monthly'}
                </p>
              </div>
            </div>
            <ManageBillingButton show={!isFreeTrial} />
          </Card>
          <div>
            {isFreeTrial ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose a paid plan before your trial ends
                </h2>
                <p className="text-gray-600 mb-4">
                  Select a plan below to keep your trainees after the trial.
                </p>
              </>
            ) : (
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Change Plan
              </h2>
            )}
            <PricingCards currentTier={subscription.tier} />
          </div>
        </>
      ) : (
        <>
          <Card>
            <p className="text-gray-600 mb-4">
              {usedFreeTrial
                ? 'Your free trial has ended. Choose a plan to continue.'
                : 'Subscribe to add trainees and create programs. Start a free trial or choose a plan below.'}
            </p>
            <PricingCards
              currentTier={null}
              showFreeTrialOption={true}
              usedFreeTrial={!!usedFreeTrial}
            />
          </Card>
        </>
      )}
    </div>
  )
}
