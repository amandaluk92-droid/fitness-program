'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { UserMinus } from 'lucide-react'
import { Button } from './Button'

export function DisconnectButton({ email }: { email: string }) {
  const router = useRouter()
  const t = useTranslations('connections')
  const [loading, setLoading] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm(t('disconnectConfirm'))) return
    setLoading(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={loading}>
      <UserMinus className="h-4 w-4 text-red-500" />
    </Button>
  )
}
