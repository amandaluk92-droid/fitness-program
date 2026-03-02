import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export const metadata: Metadata = {
  title: 'Axio',
  description: 'Track your fitness progress with personalized training programs',
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
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
