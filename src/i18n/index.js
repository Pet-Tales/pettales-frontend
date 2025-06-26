import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "./locales/en.json";
import esTranslations from "./locales/es.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: "en",
    debug: false,

    // Language detection options
    detection: {
      // Order of language detection methods - localStorage has higher priority than browser
      order: ["localStorage", "navigator", "htmlTag"],

      // Cache user language in localStorage
      caches: ["localStorage"],

      // localStorage key name
      lookupLocalStorage: "i18nextLng",

      // Don't lookup from subdomain
      lookupFromSubdomainIndex: 0,

      // Don't lookup from path
      lookupFromPathIndex: 0,

      // Check all fallback languages
      checkWhitelist: true,
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Supported languages
    supportedLngs: ["en", "es"],

    // Don't load missing keys
    saveMissing: false,

    // Namespace configuration
    defaultNS: "translation",
    ns: ["translation"],

    // React specific options
    react: {
      useSuspense: false,
    },
  });

export default i18n;
