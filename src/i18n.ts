import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files from locales folder
import enTranslations from './locales/en.json';
import taTranslations from './locales/ta.json';
import hiTranslations from './locales/hi.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import teTranslations from './locales/te.json';
import knTranslations from './locales/kn.json';
import mlTranslations from './locales/ml.json';
import mrTranslations from './locales/mr.json';
import guTranslations from './locales/gu.json';
import paTranslations from './locales/pa.json';
import bnTranslations from './locales/bn.json';
import orTranslations from './locales/or.json';
import urTranslations from './locales/ur.json';

// Language resources with all available languages
const resources = {
  en: { translation: enTranslations },
  ta: { translation: taTranslations },
  hi: { translation: hiTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
  te: { translation: teTranslations },
  kn: { translation: knTranslations },
  ml: { translation: mlTranslations },
  mr: { translation: mrTranslations },
  gu: { translation: guTranslations },
  pa: { translation: paTranslations },
  bn: { translation: bnTranslations },
  or: { translation: orTranslations },
  ur: { translation: urTranslations },
};

// Initialize i18next with global language switching support
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n to React
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false, // Set to false for production
    ns: ['translation'],
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Handle translations more gracefully
    },
  });

export default i18n;
