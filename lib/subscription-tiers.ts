import type { SubscriptionTier } from '@prisma/client'

/** Display currency for all pricing (Stripe HKD prices must match in Dashboard). */
export const DISPLAY_CURRENCY = 'HKD' as const

/** Discount for 6-month signup (10%). */
export const DISCOUNT_6_MONTHS = 0.1

/** Discount for 12-month signup (15%). */
export const DISCOUNT_12_MONTHS = 0.15

export type BillingIntervalDisplay = 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL'

/** Returns the equivalent monthly price after applying the interval discount. */
export function getDiscountedMonthlyPrice(
  priceMonthly: number,
  interval: BillingIntervalDisplay
): number {
  switch (interval) {
    case 'MONTHLY':
      return priceMonthly
    case 'SEMI_ANNUAL':
      return Math.round(priceMonthly * (1 - DISCOUNT_6_MONTHS) * 100) / 100
    case 'ANNUAL':
      return Math.round(priceMonthly * (1 - DISCOUNT_12_MONTHS) * 100) / 100
    default:
      return priceMonthly
  }
}

/** Returns a human-readable label for the billing interval. */
export function getBillingIntervalLabel(interval: BillingIntervalDisplay): string {
  switch (interval) {
    case 'MONTHLY':
      return 'billed monthly'
    case 'SEMI_ANNUAL':
      return 'billed every 6 months'
    case 'ANNUAL':
      return 'billed yearly'
    default:
      return 'billed monthly'
  }
}

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  FREE_TRIAL: 5,
  STARTER: 5,
  GROWTH: 25,
  STUDIO: 75,
  PRO: 999,
}

export function getMaxTrainees(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier] ?? 0
}

export interface TierMetadata {
  tier: SubscriptionTier
  name: string
  maxTrainees: number
  priceMonthly: number
  priceId?: string
}

/** Monthly prices in HKD (Starter/Growth/Studio/Pro). */
export const TIER_METADATA: TierMetadata[] = [
  { tier: 'FREE_TRIAL', name: 'Free Trial', maxTrainees: 5, priceMonthly: 0 },
  { tier: 'STARTER', name: 'Starter', maxTrainees: 5, priceMonthly: 148 },
  { tier: 'GROWTH', name: 'Growth', maxTrainees: 25, priceMonthly: 538 },
  { tier: 'STUDIO', name: 'Studio', maxTrainees: 75, priceMonthly: 1168 },
  { tier: 'PRO', name: 'Pro', maxTrainees: 999, priceMonthly: 2338 },
]
