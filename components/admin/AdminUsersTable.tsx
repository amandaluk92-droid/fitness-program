'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/shared/Button'
import { useToast } from '@/components/shared/Toast'
import { ResetPasswordModal } from '@/components/admin/ResetPasswordModal'
import { Shield, KeyRound } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  programsCount: number
  sessionsCount: number
  traineeCount?: number
  hasActiveSubscription: boolean
  subscriptionTier: string | null
  maxTrainees: number | null
  lastPaymentAt: Date | null
}

interface AdminUsersTableProps {
  users: AdminUser[]
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const router = useRouter()
  const t = useTranslations('admin.usersTable')
  const { showToast } = useToast()
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null)

  const handlePromote = async (userId: string) => {
    setPromotingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        showToast(data.error || t('promoteToAdmin'))
      }
    } catch {
      showToast(t('promoteToAdmin'))
    } finally {
      setPromotingId(null)
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('noUsersFound')}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 mb-4">
        <Link
          href="/admin/users"
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-50 text-primary-700"
        >
          {t('all')}
        </Link>
        <Link
          href="/admin/users?role=TRAINER"
          className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {t('trainers')}
        </Link>
        <Link
          href="/admin/users?role=TRAINEE"
          className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {t('trainees')}
        </Link>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('name')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('email')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('role')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('programs')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('subscription')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('lastPayment')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'TRAINER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{u.programsCount}</td>
              <td className="px-4 py-3 text-sm">
                {u.hasActiveSubscription && u.maxTrainees != null ? (
                  <span className="text-green-600 font-medium">
                    {u.subscriptionTier} ({(u.traineeCount ?? u.programsCount)}/{u.maxTrainees})
                  </span>
                ) : u.hasActiveSubscription ? (
                  <span className="text-green-600 font-medium">{t('active')}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {u.lastPaymentAt ? formatDate(u.lastPaymentAt) : '—'}
              </td>
              <td className="px-4 py-3 space-x-1">
                {u.role !== 'ADMIN' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={promotingId === u.id}
                    onClick={() => handlePromote(u.id)}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    {promotingId === u.id ? t('promoting') : t('promoteToAdmin')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetTarget({ id: u.id, name: u.name })}
                >
                  <KeyRound className="h-4 w-4 mr-1" />
                  {t('resetPassword')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {resetTarget && (
        <ResetPasswordModal
          userId={resetTarget.id}
          userName={resetTarget.name}
          isOpen={!!resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  )
}
