import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/shared/Card'
import { prisma } from '@/lib/prisma'
import { formatDate, formatAmountWithCurrency } from '@/lib/utils'
import { ExtendTrialButton } from '@/components/admin/ExtendTrialButton'

async function getAdminSubscriptions() {
  return prisma.trainerSubscription.findMany({
    include: {
      trainer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminSubscriptionsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const subscriptions = await getAdminSubscriptions()
  const now = new Date()
  const activeFreeTrials = subscriptions.filter(
    (s) =>
      s.tier === 'FREE_TRIAL' &&
      s.status === 'ACTIVE' &&
      s.endDate &&
      new Date(s.endDate) >= now
  )
  const t = await getTranslations('admin.subscriptions')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">
          All platform subscriptions
          {activeFreeTrials.length > 0 && (
            <span className="ml-2 text-primary-600 font-medium">
              · {activeFreeTrials.length} active free trial
              {activeFreeTrials.length !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <Card>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trainer subscriptions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interval</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End / Trial end</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((s) => {
                  const isFreeTrial = s.tier === 'FREE_TRIAL'
                  const canExtend =
                    isFreeTrial &&
                    s.status === 'ACTIVE' &&
                    s.endDate &&
                    new Date(s.endDate) >= now
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-gray-900">{s.trainer.name}</p>
                        <p className="text-gray-500">{s.trainer.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={
                            isFreeTrial
                              ? 'text-primary-600 font-medium'
                              : 'text-gray-600'
                          }
                        >
                          {isFreeTrial ? 'Free trial' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.tier}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            s.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : s.status === 'CANCELLED'
                                ? 'bg-gray-100 text-gray-800'
                                : s.status === 'PAST_DUE'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatAmountWithCurrency(s.amount, s.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.billingInterval}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.startDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.endDate ? formatDate(s.endDate) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {canExtend ? (
                          <ExtendTrialButton subscriptionId={s.id} />
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
