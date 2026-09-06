import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/translation.json'
import ptBR from '../locales/pt-BR/translation.json'

const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBR },
  'pt': { translation: ptBR },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR', 'pt'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
