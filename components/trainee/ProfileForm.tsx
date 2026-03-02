'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils'

function getProfileSchema(nameRequired: string) {
  return z.object({
    name: z.string().min(1, nameRequired),
    phone: z.string().optional(),
    age: z.union([z.string(), z.number()]).optional().transform((v) => (v === '' ? undefined : v ? Number(v) : undefined)),
    sex: z.string().optional(),
    goals: z.string().optional(),
    weight: z.union([z.string(), z.number()]).optional().transform((v) => (v === '' ? undefined : v ? Number(v) : undefined)),
    goalWeight: z.union([z.string(), z.number()]).optional().transform((v) => (v === '' ? undefined : v ? Number(v) : undefined)),
  })
}

type ProfileFormData = z.input<ReturnType<typeof getProfileSchema>>

export interface ProfileUser {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  age: number | null
  sex: string | null
  goals: string | null
  weight: number | null
  goalWeight: number | null
}

interface ProfileFormProps {
  user: ProfileUser
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('trainee.profileForm')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const sexOptions = [
    { value: '', label: t('select') },
    { value: 'Male', label: t('male') },
    { value: 'Female', label: t('female') },
    { value: 'Other', label: t('other') },
    { value: 'Prefer not to say', label: t('preferNotToSay') },
  ]

  const profileSchema = getProfileSchema(t('nameRequired'))

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      phone: user.phone ?? '',
      age: user.age != null ? String(user.age) : '',
      sex: user.sex ?? '',
      goals: user.goals ?? '',
      weight: user.weight != null ? String(user.weight) : '',
      goalWeight: user.goalWeight != null ? String(user.goalWeight) : '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        phone: data.phone || undefined,
        age: data.age !== undefined && data.age !== '' ? Number(data.age) : undefined,
        sex: data.sex || undefined,
        goals: data.goals || undefined,
        weight: data.weight !== undefined && data.weight !== '' ? Number(data.weight) : undefined,
        goalWeight: data.goalWeight !== undefined && data.goalWeight !== '' ? Number(data.goalWeight) : undefined,
      }
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || t('failedUpdate'))
        setIsLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError(t('errorOccurred'))
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {t('profileUpdated')}
        </div>
      )}

      <Input
        label={t('name')}
        type="text"
        {...register('name')}
        error={errors.name?.message}
        autoComplete="name"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
        <p className="px-3 py-2 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">{user.email}</p>
        <p className="mt-1 text-xs text-gray-500">{t('emailCannotChange')}</p>
      </div>

      <Input
        label={t('phone')}
        type="tel"
        {...register('phone')}
        error={errors.phone?.message}
        autoComplete="tel"
      />

      <Input
        label={t('age')}
        type="number"
        min={1}
        max={120}
        {...register('age')}
        error={errors.age?.message}
      />

      <Select
        label={t('sex')}
        {...register('sex')}
        error={errors.sex?.message}
        options={sexOptions}
      />

      <Input
        label={t('weightKg')}
        type="number"
        step="0.1"
        min={0}
        {...register('weight')}
        error={errors.weight?.message}
      />

      <Input
        label={t('goalWeightKg')}
        type="number"
        step="0.1"
        min={0}
        {...register('goalWeight')}
        error={errors.goalWeight?.message}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals')}</label>
        <textarea
          {...register('goals')}
          rows={4}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            errors.goals && 'border-red-500 focus:ring-red-500'
          )}
          placeholder={t('goalsPlaceholder')}
        />
        {errors.goals?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.goals.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('saving') : t('saveProfile')}
      </Button>
    </form>
  )
}
