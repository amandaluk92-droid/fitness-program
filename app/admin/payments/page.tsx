import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/shared/Card'
import { prisma } from '@/lib/prisma'
import { formatDate, formatAmountWithCurrency } from '@/lib/utils'

async function getAdminPayments() {
  return prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminPaymentsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const payments = await getAdminPayments()
  const t = await getTranslations('admin.payments')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">All payment collection records</p>
      </div>

      <Card>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments yet. Payments will appear here when payment integration is added.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900">{p.user.name}</p>
                      <p className="text-gray-500">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatAmountWithCurrency(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          p.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : p.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : p.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.description ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
