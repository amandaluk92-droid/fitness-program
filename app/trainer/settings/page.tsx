import { getTranslations } from 'next-intl/server'
import { DeleteAccountDialog } from '@/components/shared/DeleteAccountDialog'
import { NotificationPreferences } from '@/components/shared/NotificationPreferences'

export default async function TrainerSettingsPage() {
  const t = await getTranslations('settings')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('notifications.title')}</h2>
        <div className="mt-4">
          <NotificationPreferences />
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-800">{t('dangerZone')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('dangerZoneDescription')}</p>
        <div className="mt-4">
          <DeleteAccountDialog />
        </div>
      </section>
    </div>
  )
}
