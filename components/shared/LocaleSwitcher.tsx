'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { locales, localeNames, LOCALE_COOKIE } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()

  const handleChange = (newLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=31536000`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  )
}
