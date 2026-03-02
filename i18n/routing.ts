export const locales = ['en', 'zh-HK', 'zh-CN'] as const
export const defaultLocale = 'en' as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  'zh-HK': '繁體中文',
  'zh-CN': '简体中文',
}

export const LOCALE_COOKIE = 'NEXT_LOCALE'
