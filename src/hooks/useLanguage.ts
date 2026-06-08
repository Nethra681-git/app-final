import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Custom hook for easy language management throughout the app
 * Provides translation function and language change capability
 * 
 * Usage in components:
 * const { t, changeLanguage, currentLanguage, isLanguageLoaded } = useLanguage();
 * 
 * Example:
 * <span>{t('dashboard')}</span>
 * <button onClick={() => changeLanguage('hi')}>हिन्दी</button>
 */
export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback((languageCode: string) => {
    try {
      // Change language in i18n
      i18n.changeLanguage(languageCode);

      // Persist to localStorage
      localStorage.setItem('selectedLanguage', languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      localStorage.setItem('i18n', JSON.stringify({ lng: languageCode }));

      // Update HTML lang attribute for accessibility
      document.documentElement.lang = languageCode;

      // Handle RTL languages
      const rtlLanguages = ['ar', 'ur', 'he'];
      document.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';

      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18n]);

  const isLanguageLoaded = !!i18n?.language;
  const currentLanguage = i18n?.language || 'en';

  return {
    t, // Translation function
    changeLanguage, // Function to change language
    currentLanguage, // Current language code
    isLanguageLoaded, // Whether language is initialized
    i18n, // Full i18n object for advanced usage
  };
};

export default useLanguage;
