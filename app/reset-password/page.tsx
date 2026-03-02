'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{t('invalidResetLink')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('invalidResetLinkDescription')}</p>
          <Link href="/forgot-password" className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            {t('requestNewLink')}
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{t('passwordResetSuccess')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('passwordResetSuccessDescription')}</p>
          <Link href="/login" className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            {t('goToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'Invalid or expired token') {
          setError(t('invalidResetLinkDescription'))
        } else {
          setError(data.error || 'Something went wrong')
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('resetPasswordTitle')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label={t('newPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />

          <Input
            label={t('confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('resetting') : t('resetPassword')}
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
