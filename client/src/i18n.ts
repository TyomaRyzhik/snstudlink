import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationRU from './i18n/locales/ru.json';

const resources = {
  ru: {
    translation: translationRU
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'ru', // fallback language is russian
    debug: true,

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n; 