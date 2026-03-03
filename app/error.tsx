'use client'

import { useTranslations } from 'next-intl'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errorBoundary')

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <p className="mt-2 text-gray-600">{t('description')}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}
