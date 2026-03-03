import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import { ToastProvider } from '@/components/shared/Toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export const metadata: Metadata = {
  title: {
    default: 'Axio — Fitness Training Platform',
    template: '%s | Axio',
  },
  description: 'The fitness platform for trainers and trainees. Create programs, log sessions, and monitor progress. Built for Hong Kong and Asia.',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://axio.fit'),
  openGraph: {
    title: 'Axio — Fitness Training Platform',
    description: 'Create programs, log sessions, and monitor progress. Built for trainers and trainees.',
    siteName: 'Axio',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Axio',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-primary-700 focus:underline"
        >
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <ServiceWorkerRegister />
            {children}
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
