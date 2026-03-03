'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/shared/Input'
import { Checkbox } from '@/components/shared/Checkbox'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  role: z.enum(['TRAINER', 'TRAINEE']),
  name: z.string().trim().min(1, 'Account name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  newsletterOptIn: z.boolean().optional().default(false),
  termsAccepted: z.literal(true, {
    message: 'You must accept the Privacy Policy and Terms',
  }),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'TRAINEE',
      newsletterOptIn: false,
    },
  })

  const role = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          newsletterOptIn: data.newsletterOptIn ?? false,
          termsAccepted: true,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || t('genericError'))
        setIsLoading(false)
        return
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError(t('genericError'))
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">{t('iamA')}</p>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all text-center',
              role === 'TRAINER'
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <input
              type="radio"
              {...register('role')}
              value="TRAINER"
              className="sr-only"
            />
            <span className="font-medium text-gray-900">{t('trainer')}</span>
            <span className="text-xs text-gray-500 mt-0.5">{t('trainerDesc')}</span>
          </label>
          <label
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all text-center',
              role === 'TRAINEE'
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <input
              type="radio"
              {...register('role')}
              value="TRAINEE"
              className="sr-only"
            />
            <span className="font-medium text-gray-900">{t('trainee')}</span>
            <span className="text-xs text-gray-500 mt-0.5">{t('traineeDesc')}</span>
          </label>
        </div>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <Input
        label={t('accountName')}
        type="text"
        {...register('name')}
        error={errors.name?.message}
        autoComplete="name"
        placeholder={t('accountNamePlaceholder')}
      />

      <Input
        label={t('email')}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        autoComplete="email"
      />

      <Input
        label={t('password')}
        type="password"
        {...register('password')}
        error={errors.password?.message}
        autoComplete="new-password"
        placeholder={t('passwordPlaceholder')}
      />

      <Checkbox
        label={t('newsletterLabel')}
        {...register('newsletterOptIn')}
        error={errors.newsletterOptIn?.message}
      />

      <Checkbox
        label={
          <>
            {t('termsPrefix')}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              {t('privacyPolicy')}
            </Link>
            {t('termsAnd')}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              {t('termsOfService')}
            </Link>
          </>
        }
        {...register('termsAccepted')}
        error={errors.termsAccepted?.message}
      />

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? t('creatingAccount') : t('createAccountButton')}
      </Button>

      <p className="text-center text-sm text-gray-600">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          {t('signIn')}
        </Link>
      </p>
    </form>
  )
}
