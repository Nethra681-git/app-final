import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface LanguageSelectionScreenProps {
  onLanguageSelect: (language: string) => void;
}

export default function LanguageSelectionScreen({ onLanguageSelect }: LanguageSelectionScreenProps) {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
    { code: 'or', name: 'Odia', flag: '🇮🇳', nativeName: 'ଓଡିଆ' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
  ];

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
  };

  const handleProceed = () => {
    if (selectedLanguage) {
      onLanguageSelect(selectedLanguage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('selectLanguage')}
          </h1>
          <p className="text-gray-600">
            {t('selectLanguageDesc')}
          </p>
        </div>

        {/* Language Options */}
        <div className="space-y-3 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all flex items-center justify-between ${
                selectedLanguage === lang.code
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <p className="font-semibold text-gray-800">{lang.name}</p>
                  <p className="text-sm text-gray-500">{lang.nativeName}</p>
                </div>
              </div>
              {selectedLanguage === lang.code && (
                <span className="text-2xl text-blue-500">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            disabled
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleProceed}
            disabled={!selectedLanguage}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              selectedLanguage
                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('proceed')}
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          💡 {t('info')}: You can change the language anytime from settings
        </p>
      </div>
    </div>
  );
}
