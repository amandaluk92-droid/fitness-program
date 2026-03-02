import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { SessionLogForm } from '@/components/trainee/SessionLogForm'
import { Card } from '@/components/shared/Card'

export default async function LogSessionPage() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINEE') {
    redirect('/trainee/dashboard')
  }

  const t = await getTranslations('trainee.sessionsLog')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <Card>
        <SessionLogForm />
      </Card>
    </div>
  )
}
