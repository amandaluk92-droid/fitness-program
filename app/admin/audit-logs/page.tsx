import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { formatDateTime } from '@/lib/utils'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const limit = 50
  const action = params.action || ''

  const where = action ? { action } : {}

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Admin actions and security events</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-sm">
                    {log.user ? (
                      <div>
                        <p className="font-medium text-gray-900">{log.user.name}</p>
                        <p className="text-gray-500 text-xs">{log.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.resource || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.metadata ? (
                      <pre className="text-xs bg-gray-50 rounded p-1 max-w-xs overflow-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`/admin/audit-logs?page=${page - 1}${action ? `&action=${action}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/audit-logs?page=${page + 1}${action ? `&action=${action}` : ''}`}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
