import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { StripeSettingsForm } from '@/components/admin/StripeSettingsForm'
import { StripeFeesSection } from '@/components/admin/StripeFeesSection'

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const t = await getTranslations('admin.settings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">Stripe connection and payment configuration</p>
      </div>

      <StripeSettingsForm />

      <StripeFeesSection />
    </div>
  )
}
