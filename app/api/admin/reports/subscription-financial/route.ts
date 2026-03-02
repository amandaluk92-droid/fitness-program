import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { getSubscriptionFinancialReport } from '@/lib/reports/subscription-financial'

export async function GET() {
  const session = await getSession()
  const unauth = requireAdmin(session)
  if (unauth) return unauth

  try {
    const report = await getSubscriptionFinancialReport()
    return NextResponse.json(report)
  } catch (error) {
    console.error('Subscription financial report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
