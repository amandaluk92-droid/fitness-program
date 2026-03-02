import { prisma } from '@/lib/prisma'

/** Stripe HK pricing: 3.4% + HK$2.35 per successful domestic card transaction. */
const STRIPE_FEE_PERCENT = 0.034
const STRIPE_FEE_FIXED_HKD = 2.35

function stripeFeeForAmount(amount: number): number {
  return amount * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED_HKD
}

export interface SubscriptionFinancialRow {
  trainerId: string
  trainerName: string
  trainerEmail: string
  totalCharged: number
  stripeFee: number
  netRemaining: number
}

export interface SubscriptionFinancialTotals {
  totalCharged: number
  totalStripeFee: number
  totalNetRemaining: number
}

export interface SubscriptionFinancialReport {
  rows: SubscriptionFinancialRow[]
  totals: SubscriptionFinancialTotals
}

export async function getSubscriptionFinancialReport(): Promise<SubscriptionFinancialReport> {
  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER' },
    select: { id: true, name: true, email: true },
  })

  const completedPayments = await prisma.payment.findMany({
    where: { status: 'COMPLETED' },
    select: { userId: true, amount: true },
  })

  const chargedByTrainer = new Map<string, number>()
  const feeByTrainer = new Map<string, number>()

  for (const p of completedPayments) {
    const current = chargedByTrainer.get(p.userId) ?? 0
    chargedByTrainer.set(p.userId, current + p.amount)
    const fee = stripeFeeForAmount(p.amount)
    const currentFee = feeByTrainer.get(p.userId) ?? 0
    feeByTrainer.set(p.userId, currentFee + fee)
  }

  const rows: SubscriptionFinancialRow[] = trainers.map((t) => {
    const totalCharged = chargedByTrainer.get(t.id) ?? 0
    const stripeFee = feeByTrainer.get(t.id) ?? 0
    const netRemaining = totalCharged - stripeFee
    return {
      trainerId: t.id,
      trainerName: t.name ?? '',
      trainerEmail: t.email,
      totalCharged,
      stripeFee,
      netRemaining,
    }
  })

  const totals: SubscriptionFinancialTotals = {
    totalCharged: rows.reduce((s, r) => s + r.totalCharged, 0),
    totalStripeFee: rows.reduce((s, r) => s + r.stripeFee, 0),
    totalNetRemaining: rows.reduce((s, r) => s + r.netRemaining, 0),
  }

  return { rows, totals }
}
