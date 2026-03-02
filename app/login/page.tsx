import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/LoginForm'
import { DemoCredentialsBox } from '@/components/auth/DemoCredentialsBox'
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher'

export default async function LoginPage() {
  const t = await getTranslations('auth')

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="absolute top-4 right-4">
          <LocaleSwitcher />
        </div>
        <div className="flex justify-center mb-6">
          <Image src="/axio-logo.png" alt="Axio" width={450} height={126} className="h-[126px] w-auto" priority />
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('signInTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('signInSubtitle')}
          </p>
        </div>
        <LoginForm />

        <DemoCredentialsBox />
      </div>
    </div>
  )
}
