'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
        setIsLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{t('checkEmail')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('checkEmailDescription')}</p>
          <Link href="/login" className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('forgotPasswordTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('forgotPasswordDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('sending') : t('sendResetLink')}
          </Button>

          <p className="text-center text-sm">
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('backToLogin')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
