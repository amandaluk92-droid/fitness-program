import Stripe from 'stripe'
import type { SubscriptionTier } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type BillingIntervalForPrice = 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL'

function envStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  return key ? new Stripe(key, { typescript: true }) : null
}

function envPriceIds(): Record<SubscriptionTier, string | undefined> {
  return {
    FREE_TRIAL: undefined,
    STARTER: process.env.STRIPE_PRICE_STARTER,
    GROWTH: process.env.STRIPE_PRICE_GROWTH,
    STUDIO: process.env.STRIPE_PRICE_STUDIO,
    PRO: process.env.STRIPE_PRICE_PRO,
  }
}

function envPriceIdsByInterval(
  interval: BillingIntervalForPrice
): Record<SubscriptionTier, string | undefined> {
  if (interval === 'MONTHLY') {
    return envPriceIds()
  }
  const suffix = interval === 'SEMI_ANNUAL' ? '_6MO' : '_12MO'
  return {
    FREE_TRIAL: undefined,
    STARTER: process.env[`STRIPE_PRICE_STARTER${suffix}`],
    GROWTH: process.env[`STRIPE_PRICE_GROWTH${suffix}`],
    STUDIO: process.env[`STRIPE_PRICE_STUDIO${suffix}`],
    PRO: process.env[`STRIPE_PRICE_PRO${suffix}`],
  }
}

function envWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET
}

/** Returns true if DB config has all required fields for checkout + webhook. */
function isDbConfigComplete(row: {
  stripeSecretKey: string | null
  stripeWebhookSecret: string | null
  stripePriceIdStarter: string | null
  stripePriceIdGrowth: string | null
  stripePriceIdStudio: string | null
  stripePriceIdPro: string | null
}): boolean {
  return !!(
    row.stripeSecretKey &&
    row.stripeWebhookSecret &&
    row.stripePriceIdStarter &&
    row.stripePriceIdGrowth &&
    row.stripePriceIdStudio &&
    row.stripePriceIdPro
  )
}

export interface ResolvedStripeConfig {
  stripe: Stripe | null
  webhookSecret: string | null
  getPriceIdForTier: (tier: SubscriptionTier) => string | null
  getPriceIdForTierAndInterval: (
    tier: SubscriptionTier,
    interval: BillingIntervalForPrice
  ) => string | null
}

function getDbPriceIdForInterval(
  row: {
    stripePriceIdStarter: string | null
    stripePriceIdGrowth: string | null
    stripePriceIdStudio: string | null
    stripePriceIdPro: string | null
    stripePriceIdStarter6mo: string | null
    stripePriceIdStarter12mo: string | null
    stripePriceIdGrowth6mo: string | null
    stripePriceIdGrowth12mo: string | null
    stripePriceIdStudio6mo: string | null
    stripePriceIdStudio12mo: string | null
    stripePriceIdPro6mo: string | null
    stripePriceIdPro12mo: string | null
  },
  tier: SubscriptionTier,
  interval: BillingIntervalForPrice
): string | null {
  const monthly = {
    STARTER: row.stripePriceIdStarter,
    GROWTH: row.stripePriceIdGrowth,
    STUDIO: row.stripePriceIdStudio,
    PRO: row.stripePriceIdPro,
  }[tier]
  if (interval === 'MONTHLY') return monthly ?? null
  const sixMo = {
    STARTER: row.stripePriceIdStarter6mo,
    GROWTH: row.stripePriceIdGrowth6mo,
    STUDIO: row.stripePriceIdStudio6mo,
    PRO: row.stripePriceIdPro6mo,
  }[tier]
  const twelveMo = {
    STARTER: row.stripePriceIdStarter12mo,
    GROWTH: row.stripePriceIdGrowth12mo,
    STUDIO: row.stripePriceIdStudio12mo,
    PRO: row.stripePriceIdPro12mo,
  }[tier]
  const id = interval === 'SEMI_ANNUAL' ? sixMo : twelveMo
  return (id ?? monthly) ?? null
}

/**
 * Resolves Stripe config: prefers DB (admin-configured) when complete, else env.
 * Use this in API routes (checkout, portal, webhook) so one source is used everywhere.
 */
export async function getStripeConfig(): Promise<ResolvedStripeConfig> {
  const row = await prisma.stripeConfig.findFirst({ orderBy: { updatedAt: 'desc' } })

  if (row && isDbConfigComplete(row)) {
    const stripe = new Stripe(row.stripeSecretKey!, { typescript: true })
    const priceIds: Record<SubscriptionTier, string | undefined> = {
      FREE_TRIAL: undefined,
      STARTER: row.stripePriceIdStarter ?? undefined,
      GROWTH: row.stripePriceIdGrowth ?? undefined,
      STUDIO: row.stripePriceIdStudio ?? undefined,
      PRO: row.stripePriceIdPro ?? undefined,
    }
    return {
      stripe,
      webhookSecret: row.stripeWebhookSecret,
      getPriceIdForTier: (tier: SubscriptionTier) => priceIds[tier] ?? null,
      getPriceIdForTierAndInterval: (tier: SubscriptionTier, interval: BillingIntervalForPrice) =>
        getDbPriceIdForInterval(row, tier, interval),
    }
  }

  const envIds = envPriceIds()
  return {
    stripe: envStripeClient(),
    webhookSecret: envWebhookSecret() ?? null,
    getPriceIdForTier: (tier: SubscriptionTier) => envIds[tier] ?? null,
    getPriceIdForTierAndInterval: (tier: SubscriptionTier, interval: BillingIntervalForPrice) => {
      const ids = envPriceIdsByInterval(interval)
      const id = ids[tier]
      if (id) return id
      return interval === 'MONTHLY' ? null : envIds[tier] ?? null
    },
  }
}

/** Legacy export: uses env only. Prefer getStripeConfig() in API routes. */
export const stripe =
  process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
    : null

const PRICE_IDS: Record<SubscriptionTier, string | undefined> = {
  FREE_TRIAL: undefined,
  STARTER: process.env.STRIPE_PRICE_STARTER,
  GROWTH: process.env.STRIPE_PRICE_GROWTH,
  STUDIO: process.env.STRIPE_PRICE_STUDIO,
  PRO: process.env.STRIPE_PRICE_PRO,
}

export function getPriceIdForTier(tier: SubscriptionTier): string | null {
  return PRICE_IDS[tier] ?? null
}
