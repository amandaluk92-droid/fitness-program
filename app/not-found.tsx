import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/shared/Button'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">{t('title')}</h2>
        <p className="text-gray-600 mt-2">{t('description')}</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>{t('goHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
