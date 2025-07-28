import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// Get locale from localStorage or browser
const getLocale = (): string => {
  const stored = localStorage.getItem('locale')
  if (stored && messages[stored as keyof typeof messages]) {
    return stored
  }
  
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  
  return 'en-US'
}

const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'en-US',
  messages,
  globalInjection: true
})

export default i18n

// Export locale switching function
export const switchLocale = (locale: string) => {
  if (messages[locale as keyof typeof messages]) {
    i18n.global.locale.value = locale as any
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
  }
}
