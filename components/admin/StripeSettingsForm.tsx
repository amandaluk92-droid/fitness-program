'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'

interface SettingsData {
  stripeSecretKeyMasked: string
  stripeWebhookSecretMasked: string
  stripePriceIdStarter: string | null
  stripePriceIdGrowth: string | null
  stripePriceIdStudio: string | null
  stripePriceIdPro: string | null
  stripePriceIdStarter6mo: string | null
  stripePriceIdStarter12mo: string | null
  stripePriceIdGrowth6mo: string | null
  stripePriceIdGrowth12mo: string | null
  stripePriceIdStudio6mo: string | null
  stripePriceIdStudio12mo: string | null
  stripePriceIdPro6mo: string | null
  stripePriceIdPro12mo: string | null
  stripePublishableKey: string | null
}

export function StripeSettingsForm() {
  const t = useTranslations('admin.stripeSettings')
  const tCommon = useTranslations('common')
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [stripeSecretKey, setStripeSecretKey] = useState('')
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('')
  const [stripePriceIdStarter, setStripePriceIdStarter] = useState('')
  const [stripePriceIdGrowth, setStripePriceIdGrowth] = useState('')
  const [stripePriceIdStudio, setStripePriceIdStudio] = useState('')
  const [stripePriceIdPro, setStripePriceIdPro] = useState('')
  const [stripePriceIdStarter6mo, setStripePriceIdStarter6mo] = useState('')
  const [stripePriceIdStarter12mo, setStripePriceIdStarter12mo] = useState('')
  const [stripePriceIdGrowth6mo, setStripePriceIdGrowth6mo] = useState('')
  const [stripePriceIdGrowth12mo, setStripePriceIdGrowth12mo] = useState('')
  const [stripePriceIdStudio6mo, setStripePriceIdStudio6mo] = useState('')
  const [stripePriceIdStudio12mo, setStripePriceIdStudio12mo] = useState('')
  const [stripePriceIdPro6mo, setStripePriceIdPro6mo] = useState('')
  const [stripePriceIdPro12mo, setStripePriceIdPro12mo] = useState('')
  const [stripePublishableKey, setStripePublishableKey] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setStripePriceIdStarter(json.stripePriceIdStarter ?? '')
          setStripePriceIdGrowth(json.stripePriceIdGrowth ?? '')
          setStripePriceIdStudio(json.stripePriceIdStudio ?? '')
          setStripePriceIdPro(json.stripePriceIdPro ?? '')
          setStripePriceIdStarter6mo(json.stripePriceIdStarter6mo ?? '')
          setStripePriceIdStarter12mo(json.stripePriceIdStarter12mo ?? '')
          setStripePriceIdGrowth6mo(json.stripePriceIdGrowth6mo ?? '')
          setStripePriceIdGrowth12mo(json.stripePriceIdGrowth12mo ?? '')
          setStripePriceIdStudio6mo(json.stripePriceIdStudio6mo ?? '')
          setStripePriceIdStudio12mo(json.stripePriceIdStudio12mo ?? '')
          setStripePriceIdPro6mo(json.stripePriceIdPro6mo ?? '')
          setStripePriceIdPro12mo(json.stripePriceIdPro12mo ?? '')
          setStripePublishableKey(json.stripePublishableKey ?? '')
        }
      } catch {
        if (!cancelled) setMessage({ type: 'error', text: t('loadError') })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeSecretKey: stripeSecretKey || undefined,
          stripeWebhookSecret: stripeWebhookSecret || undefined,
          stripePriceIdStarter: stripePriceIdStarter || undefined,
          stripePriceIdGrowth: stripePriceIdGrowth || undefined,
          stripePriceIdStudio: stripePriceIdStudio || undefined,
          stripePriceIdPro: stripePriceIdPro || undefined,
          stripePriceIdStarter6mo: stripePriceIdStarter6mo || undefined,
          stripePriceIdStarter12mo: stripePriceIdStarter12mo || undefined,
          stripePriceIdGrowth6mo: stripePriceIdGrowth6mo || undefined,
          stripePriceIdGrowth12mo: stripePriceIdGrowth12mo || undefined,
          stripePriceIdStudio6mo: stripePriceIdStudio6mo || undefined,
          stripePriceIdStudio12mo: stripePriceIdStudio12mo || undefined,
          stripePriceIdPro6mo: stripePriceIdPro6mo || undefined,
          stripePriceIdPro12mo: stripePriceIdPro12mo || undefined,
          stripePublishableKey: stripePublishableKey || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || t('errorOccurred'))
      setMessage({ type: 'success', text: t('saved') })
      const getRes = await fetch('/api/admin/settings')
      if (getRes.ok) setData(await getRes.json())
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('errorOccurred'),
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card title={t('title')}>
        <p className="text-gray-500">{tCommon('loading')}</p>
      </Card>
    )
  }

  return (
    <Card title={t('title')}>
      <p className="text-sm text-gray-600 mb-4">
        Connect your Stripe account so trainer subscription payments go to you. Leave a field blank to keep the current value. Get keys from{' '}
        <a
          href="https://dashboard.stripe.com/apikeys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline"
        >
          Stripe Dashboard → API keys
        </a>
        , and Price IDs from Billing → Products.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('secretKey')}
          type="password"
          autoComplete="off"
          placeholder={data?.stripeSecretKeyMasked ? 'Leave blank to keep current' : 'sk_live_… or sk_test_…'}
          value={stripeSecretKey}
          onChange={(e) => setStripeSecretKey(e.target.value)}
        />
        {data?.stripeSecretKeyMasked && (
          <p className="text-xs text-gray-500">Current: {data.stripeSecretKeyMasked}</p>
        )}
        <Input
          label={t('webhookSecret')}
          type="password"
          autoComplete="off"
          placeholder={data?.stripeWebhookSecretMasked ? 'Leave blank to keep current' : 'whsec_…'}
          value={stripeWebhookSecret}
          onChange={(e) => setStripeWebhookSecret(e.target.value)}
        />
        {data?.stripeWebhookSecretMasked && (
          <p className="text-xs text-gray-500">Current: {data.stripeWebhookSecretMasked}</p>
        )}
        <Input
          label={t('priceIdStarter')}
          placeholder="price_…"
          value={stripePriceIdStarter}
          onChange={(e) => setStripePriceIdStarter(e.target.value)}
        />
        <Input
          label={t('priceIdGrowth')}
          placeholder="price_…"
          value={stripePriceIdGrowth}
          onChange={(e) => setStripePriceIdGrowth(e.target.value)}
        />
        <Input
          label={t('priceIdStudio')}
          placeholder="price_…"
          value={stripePriceIdStudio}
          onChange={(e) => setStripePriceIdStudio(e.target.value)}
        />
        <Input
          label={t('priceIdPro')}
          placeholder="price_…"
          value={stripePriceIdPro}
          onChange={(e) => setStripePriceIdPro(e.target.value)}
        />
        <p className="text-sm font-medium text-gray-700 pt-2">6-month / 12-month (discount prices)</p>
        <Input
          label={t('priceIdStarter6mo')}
          placeholder="price_…"
          value={stripePriceIdStarter6mo}
          onChange={(e) => setStripePriceIdStarter6mo(e.target.value)}
        />
        <Input
          label={t('priceIdStarter12mo')}
          placeholder="price_…"
          value={stripePriceIdStarter12mo}
          onChange={(e) => setStripePriceIdStarter12mo(e.target.value)}
        />
        <Input
          label={t('priceIdGrowth6mo')}
          placeholder="price_…"
          value={stripePriceIdGrowth6mo}
          onChange={(e) => setStripePriceIdGrowth6mo(e.target.value)}
        />
        <Input
          label={t('priceIdGrowth12mo')}
          placeholder="price_…"
          value={stripePriceIdGrowth12mo}
          onChange={(e) => setStripePriceIdGrowth12mo(e.target.value)}
        />
        <Input
          label={t('priceIdStudio6mo')}
          placeholder="price_…"
          value={stripePriceIdStudio6mo}
          onChange={(e) => setStripePriceIdStudio6mo(e.target.value)}
        />
        <Input
          label={t('priceIdStudio12mo')}
          placeholder="price_…"
          value={stripePriceIdStudio12mo}
          onChange={(e) => setStripePriceIdStudio12mo(e.target.value)}
        />
        <Input
          label={t('priceIdPro6mo')}
          placeholder="price_…"
          value={stripePriceIdPro6mo}
          onChange={(e) => setStripePriceIdPro6mo(e.target.value)}
        />
        <Input
          label={t('priceIdPro12mo')}
          placeholder="price_…"
          value={stripePriceIdPro12mo}
          onChange={(e) => setStripePriceIdPro12mo(e.target.value)}
        />
        <Input
          label={t('publishableKey')}
          type="password"
          autoComplete="off"
          placeholder="pk_live_… or pk_test_…"
          value={stripePublishableKey}
          onChange={(e) => setStripePublishableKey(e.target.value)}
        />
        {message && (
          <p className={message.type === 'success' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </form>
    </Card>
  )
}
