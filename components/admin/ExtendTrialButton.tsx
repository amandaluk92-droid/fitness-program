'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { useToast } from '@/components/shared/Toast'

interface ExtendTrialButtonProps {
  subscriptionId: string
  disabled?: boolean
}

export function ExtendTrialButton({
  subscriptionId,
  disabled = false,
}: ExtendTrialButtonProps) {
  const router = useRouter()
  const t = useTranslations('admin.extendTrial')
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleExtend = async (days: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/extend`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extendDays: days }),
        }
      )
      const data = await res.json()
      if (res.ok) {
        router.refresh()
      } else {
        showToast(data.error || t('extend7Days'))
      }
    } catch {
      showToast(t('extend7Days'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex gap-2">
      <Button
        variant="outline"
        className="text-xs py-1 px-2"
        disabled={disabled || loading}
        onClick={() => handleExtend(7)}
      >
        {loading ? '…' : t('extend7Days')}
      </Button>
      <Button
        variant="outline"
        className="text-xs py-1 px-2"
        disabled={disabled || loading}
        onClick={() => handleExtend(14)}
      >
        {t('extend14Days')}
      </Button>
    </span>
  )
}
