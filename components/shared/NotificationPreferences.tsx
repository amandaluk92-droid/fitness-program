'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export function NotificationPreferences() {
  const t = useTranslations('settings.notifications')
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((res) => res.json())
      .then((data) => setEnabled(data.emailNotifications))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async () => {
    const prev = enabled
    setEnabled(!prev)

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: !prev }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setEnabled(prev)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{t('emailNotifications')}</p>
        <p className="text-sm text-gray-500">{t('emailNotificationsDescription')}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
