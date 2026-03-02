'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'

interface ManageBillingButtonProps {
  /** Hide for free trial (no Stripe customer). Default true. */
  show?: boolean
}

export function ManageBillingButton({ show = true }: ManageBillingButtonProps) {
  const t = useTranslations('trainer.manageBilling')
  const [loading, setLoading] = useState(false)
  if (!show) return null

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || t('manageBilling'))
      }
    } catch (e) {
      alert(t('manageBilling'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="mt-4"
    >
      {loading ? t('opening') : t('manageBilling')}
    </Button>
  )
}
