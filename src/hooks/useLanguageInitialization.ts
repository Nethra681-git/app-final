import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to initialize language on first login
 * Returns true when language is selected and ready to proceed
 */
export const useLanguageInitialization = () => {
  const { i18n } = useTranslation();
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if language was previously selected
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const isFirstTime = !localStorage.getItem('hasSelectedLanguage');

    if (savedLanguage && i18n.isInitialized) {
      i18n.changeLanguage(savedLanguage);
      setIsLanguageSelected(true);
    } else if (!isFirstTime) {
      // User has been here before but no language saved, just mark as selected
      setIsLanguageSelected(true);
    }

    setIsLoading(false);
  }, [i18n.isInitialized]);

  const completeLanguageSelection = (language: string) => {
    localStorage.setItem('selectedLanguage', language);
    localStorage.setItem('hasSelectedLanguage', 'true');
    i18n.changeLanguage(language);
    setIsLanguageSelected(true);
  };

  return {
    isLanguageSelected,
    isLoading,
    completeLanguageSelection,
    currentLanguage: i18n.language,
  };
};
