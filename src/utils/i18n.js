import { I18n } from 'i18n-js';
import * as RNLocalize from 'react-native-localize';
import en from '../locales/en.json';
import es from '../locales/es.json';

// Configure i18n
const i18n = new I18n({
  en,
  es,
});

// Set default fallback language
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

/**
 * Initialize localization based on device settings
 * Supports regional variants (es-MX, es-ES, en-US, etc.)
 * Falls back to base language (es, en) if region not found
 */
export const initializeI18n = () => {
  // Get device locales in order of preference
  const locales = RNLocalize.getLocales();

  if (locales && locales.length > 0) {
    // Try to find exact match first (e.g., es-MX)
    // Then try base language (e.g., es)
    const bestMatch = locales.find(locale => {
      const languageTag = locale.languageTag; // e.g., "es-MX"
      const languageCode = locale.languageCode; // e.g., "es"

      // Check if we support this exact locale or its base language
      return i18n.translations[languageTag] || i18n.translations[languageCode];
    });

    if (bestMatch) {
      // Try full locale first, fall back to base language
      const languageTag = bestMatch.languageTag;
      const languageCode = bestMatch.languageCode;

      if (i18n.translations[languageTag]) {
        i18n.locale = languageTag;
      } else if (i18n.translations[languageCode]) {
        i18n.locale = languageCode;
      }
    }
  }

  console.log('Initialized i18n with locale:', i18n.locale);
};

/**
 * Translate a key
 * @param {string} key - Translation key (e.g., 'welcome.title')
 * @param {object} options - Interpolation options
 * @returns {string} Translated string
 */
export const t = (key, options = {}) => {
  return i18n.t(key, options);
};

/**
 * Get current locale
 * @returns {string} Current locale code
 */
export const getCurrentLocale = () => {
  return i18n.locale;
};

/**
 * Change locale manually
 * @param {string} locale - Locale code (e.g., 'es', 'en')
 */
export const changeLocale = (locale) => {
  i18n.locale = locale;
};

// Initialize on import
initializeI18n();

export default i18n;
