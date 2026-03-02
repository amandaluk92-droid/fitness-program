import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { LocaleSwitcher } from '@/components/shared/LocaleSwitcher'

export default async function RegisterPage() {
  const t = await getTranslations('auth')

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center mb-6">
          <Image src="/axio-logo.png" alt="Axio" width={450} height={126} className="h-[126px] w-auto" priority />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t('createAccount')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('createAccountSubtitle')}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
