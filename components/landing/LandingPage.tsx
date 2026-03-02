'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher'
import {
  Dumbbell,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
} from 'lucide-react'

export function LandingPage() {
  const t = useTranslations('landing')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/axio-logo.png"
              alt="Axio"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
          </div>
          <nav className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {t('logIn')}
            </Link>
            <Link href="/register">
              <Button>{t('getStarted')}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t('heroTitle1')}
              <span className="block text-primary-600">{t('heroTitle2')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              {t('heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('getStarted')}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('logIn')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {t('featuresTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            {t('featuresSubtitle')}
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                {t('feature1Title')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('feature1Desc')}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                {t('feature2Title')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('feature2Desc')}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                {t('feature3Title')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('feature3Desc')}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                {t('feature4Title')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('feature4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {t('pricingTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            {t('pricingSubtitle')}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">
                {t('freeTrial')}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">
                {t('fromPrice')}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">
                {t('upToTrainees')}
              </span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="/register">
              <Button size="lg">{t('startTrial')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Axio. {t('footerCopyright')}</p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('terms')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
