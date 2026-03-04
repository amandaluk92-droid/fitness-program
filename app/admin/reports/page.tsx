import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { getSubscriptionFinancialReport } from '@/lib/reports/subscription-financial'
import { ReportExportButtons } from '@/components/admin/ReportExportButtons'
import { formatCurrencyHKD } from '@/lib/utils'

export default async function AdminReportsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const { rows, totals } = await getSubscriptionFinancialReport()
  const t = await getTranslations('admin.reports')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">
          Subscription income per trainer, Stripe fees, and net remaining.
        </p>
      </div>

      <Card
        title="Subscription financial report"
        action={<ReportExportButtons />}
      >
        {rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trainer data yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trainer name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total charged
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Stripe fee
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Net remaining
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r) => (
                  <tr key={r.trainerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.trainerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.trainerEmail}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrencyHKD(r.totalCharged)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatCurrencyHKD(r.stripeFee)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrencyHKD(r.netRemaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {formatCurrencyHKD(totals.totalCharged)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatCurrencyHKD(totals.totalStripeFee)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {formatCurrencyHKD(totals.totalNetRemaining)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Card title="Audit Logs">
        <p className="text-sm text-gray-600 mb-4">View all admin actions and security events.</p>
        <Link href="/admin/audit-logs">
          <Button variant="outline">View Audit Logs</Button>
        </Link>
      </Card>
    </div>
  )
}
