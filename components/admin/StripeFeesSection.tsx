import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/shared/Card'

export async function StripeFeesSection() {
  const t = await getTranslations('admin.stripeFees')

  return (
    <Card title={t('title')}>
      <p className="text-sm text-gray-600 mb-4">
        {t('pricingNote')}{' '}
        <a
          href="https://stripe.com/en-hk/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline"
        >
          stripe.com/en-hk/pricing
        </a>
        .
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 font-medium text-gray-900">{t('type')}</th>
              <th className="px-4 py-2 font-medium text-gray-900">{t('fee')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('domesticCards')}</td>
              <td className="px-4 py-2">{t('domesticCardsValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('internationalCards')}</td>
              <td className="px-4 py-2">{t('internationalCardsValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('manuallyEntered')}</td>
              <td className="px-4 py-2">{t('manuallyEnteredValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('alipayWechat')}</td>
              <td className="px-4 py-2">{t('alipayWechatValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('billingSubscriptions')}</td>
              <td className="px-4 py-2">{t('billingSubscriptionsValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('disputes')}</td>
              <td className="px-4 py-2">{t('disputesValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('refunds')}</td>
              <td className="px-4 py-2">{t('refundsValue')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-700">{t('setupMonthly')}</td>
              <td className="px-4 py-2">{t('setupMonthlyValue')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  )
}
