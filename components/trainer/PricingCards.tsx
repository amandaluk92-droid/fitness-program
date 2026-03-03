'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import {
  TIER_METADATA,
  DISPLAY_CURRENCY,
  getDiscountedMonthlyPrice,
  DISCOUNT_6_MONTHS,
  DISCOUNT_12_MONTHS,
  type BillingIntervalDisplay,
} from '@/lib/subscription-tiers'
import { useToast } from '@/components/shared/Toast'
import type { SubscriptionTier } from '@prisma/client'

const PAID_TIERS = TIER_METADATA.filter((t) => t.tier !== 'FREE_TRIAL')

interface PricingCardsProps {
  currentTier: SubscriptionTier | null
  /** Show "Start free trial" card when trainer has no subscription. */
  showFreeTrialOption?: boolean
  /** Trainer already used their one-time trial. */
  usedFreeTrial?: boolean
}

export function PricingCards({
  currentTier,
  showFreeTrialOption = false,
  usedFreeTrial = false,
}: PricingCardsProps) {
  const router = useRouter()
  const t = useTranslations('trainer.pricingCards')
  const { showToast } = useToast()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [trialLoading, setTrialLoading] = useState(false)

  const handleSubscribe = async (
    tier: SubscriptionTier,
    interval: BillingIntervalDisplay
  ) => {
    const key = `${tier}-${interval}`
    setLoadingKey(key)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        showToast(data.error || t('failedCheckout'))
      }
    } catch {
      showToast(t('failedCheckout'))
    } finally {
      setLoadingKey(null)
    }
  }

  const handleStartFreeTrial = async () => {
    setTrialLoading(true)
    try {
      const res = await fetch('/api/trainer/trial/start', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        router.refresh()
      } else {
        showToast(data.error || t('failedTrial'))
      }
    } catch {
      showToast(t('failedTrial'))
    } finally {
      setTrialLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {showFreeTrialOption && !usedFreeTrial && (
        <Card className="flex flex-col border-primary-200 bg-primary-50/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('freeTrial')}</h3>
            <p className="text-2xl font-bold text-primary-600 mt-1">
              {DISPLAY_CURRENCY === 'HKD' ? 'HK$0' : '$0'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {t('twoWeeksUpTo5')}
            </p>
          </div>
          <Button
            className="mt-auto"
            disabled={trialLoading || loadingKey !== null}
            onClick={handleStartFreeTrial}
          >
            {trialLoading ? t('starting') : t('start2WeekTrial')}
          </Button>
        </Card>
      )}
      {PAID_TIERS.map((tier) => {
        const isCurrent = currentTier === tier.tier
        const priceMonthly = tier.priceMonthly
        const price6mo = getDiscountedMonthlyPrice(priceMonthly, 'SEMI_ANNUAL')
        const price12mo = getDiscountedMonthlyPrice(priceMonthly, 'ANNUAL')
        const prefix = DISPLAY_CURRENCY === 'HKD' ? 'HK$' : '$'
        return (
          <Card key={tier.tier} className="flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {prefix}{priceMonthly.toLocaleString()}/mo
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('upToTrainees', { count: tier.maxTrainees })}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {prefix}{price6mo.toLocaleString()}/mo {t('whenBilled6mo')} ({t('percentOff', { pct: Math.round(DISCOUNT_6_MONTHS * 100) })})
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {prefix}{price12mo.toLocaleString()}/mo {t('whenBilledYearly')} (
                {t('percentOff', { pct: Math.round(DISCOUNT_12_MONTHS * 100) })})
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Button
                disabled={isCurrent || loadingKey !== null || trialLoading}
                onClick={() => handleSubscribe(tier.tier, 'MONTHLY')}
              >
                {loadingKey === `${tier.tier}-MONTHLY`
                  ? t('redirecting')
                  : isCurrent
                    ? t('currentPlan')
                    : t('subscribeMonthly')}
              </Button>
              <Button
                variant="outline"
                disabled={isCurrent || loadingKey !== null || trialLoading}
                onClick={() => handleSubscribe(tier.tier, 'SEMI_ANNUAL')}
              >
                {loadingKey === `${tier.tier}-SEMI_ANNUAL`
                  ? t('redirecting')
                  : t('subscribe6mo')}
              </Button>
              <Button
                variant="outline"
                disabled={isCurrent || loadingKey !== null || trialLoading}
                onClick={() => handleSubscribe(tier.tier, 'ANNUAL')}
              >
                {loadingKey === `${tier.tier}-ANNUAL`
                  ? t('redirecting')
                  : t('subscribeYearly')}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
