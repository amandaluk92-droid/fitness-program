'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from './Card'
import { CheckCircle2, Circle, X } from 'lucide-react'
import Link from 'next/link'

interface OnboardingChecklistProps {
  role: 'TRAINER' | 'TRAINEE'
}

interface OnboardingStatus {
  profileComplete: boolean
  hasConnection: boolean
  hasProgram: boolean
  hasSession: boolean
  accountAgeDays: number
  allComplete: boolean
}

export function OnboardingChecklist({ role }: OnboardingChecklistProps) {
  const t = useTranslations('onboarding')
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = `onboarding_dismissed_${role}`
    if (localStorage.getItem(key) === 'true') {
      setDismissed(true)
      setLoading(false)
      return
    }

    fetch('/api/onboarding/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data)
        if (data.allComplete || data.accountAgeDays > 7) {
          setDismissed(true)
        }
      })
      .catch(() => setDismissed(true))
      .finally(() => setLoading(false))
  }, [role])

  const handleDismiss = () => {
    localStorage.setItem(`onboarding_dismissed_${role}`, 'true')
    setDismissed(true)
  }

  if (loading || dismissed || !status) return null

  const items = role === 'TRAINEE'
    ? [
        { done: status.profileComplete, label: t('completeProfile'), href: '/trainee/profile' },
        { done: status.hasConnection, label: t('connectTrainer'), href: '/trainee/dashboard' },
        { done: status.hasProgram, label: t('viewProgram'), href: '/trainee/dashboard' },
        { done: status.hasSession, label: t('logFirstSession'), href: '/trainee/sessions/log' },
      ]
    : [
        { done: status.profileComplete, label: t('completeProfile'), href: '/trainer/settings' },
        { done: status.hasConnection, label: t('connectTrainee'), href: '/trainer/trainees' },
        { done: status.hasProgram, label: t('createProgram'), href: '/trainer/programs' },
      ]

  const completedCount = items.filter((i) => i.done).length

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{t('title')}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('progress', { done: completedCount, total: items.length })}
          </p>
        </div>
        <button onClick={handleDismiss} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
