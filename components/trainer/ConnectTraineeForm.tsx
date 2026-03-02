'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { UserPlus } from 'lucide-react'

export function ConnectTraineeForm() {
  const router = useRouter()
  const t = useTranslations('trainer.connectTraineeForm')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('failedToConnect'))
        return
      }
      setSuccess(data.message === 'Already connected' ? t('alreadyConnected') : t('connectedSuccess'))
      setEmail('')
      router.refresh()
    } catch {
      setError(t('failedToConnect'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Input
            label={t('traineeEmail')}
            type="email"
            placeholder={t('placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={undefined}
          />
        </div>
        <Button type="submit" disabled={!email.trim() || isLoading}>
          <UserPlus className="h-4 w-4 mr-2" />
          {isLoading ? t('connecting') : t('connectBtn')}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </form>
  )
}
