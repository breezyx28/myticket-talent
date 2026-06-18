import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { applyDocumentDirection } from '@/lib/language-core';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
  document.title = i18n.t('brand.documentTitle');
});
applyDocumentDirection(i18n.language);
document.title = i18n.t('brand.documentTitle');

export default i18n;
