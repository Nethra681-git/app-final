import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
  };

  const currentLang = languages.find((lang) => lang.code === i18n.language);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <span className="text-xl">{currentLang?.flag}</span>
        <span>{currentLang?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                i18n.language === lang.code ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className={i18n.language === lang.code ? 'font-semibold text-blue-600' : ''}>
                {lang.name}
              </span>
              {i18n.language === lang.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
