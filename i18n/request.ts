import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, LOCALE_COOKIE } from './routing'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  let locale = cookieStore.get(LOCALE_COOKIE)?.value
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: locale === 'zh-HK' || locale === 'zh-CN' ? 'Asia/Hong_Kong' : 'UTC',
  }
})
