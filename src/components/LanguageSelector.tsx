import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { getAvailableLanguages } from '@/lib/translationService';
import { useState } from 'react';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: string) => void;
  compact?: boolean;
}

const LanguageSelector = ({ onLanguageChange, compact = false }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const languages = getAvailableLanguages();
  const [isOpen, setIsOpen] = useState(false);

  // Ensure i18n is ready before rendering
  if (!i18n || !i18n.language) {
    return compact ? (
      <div className="px-2 py-1 text-xs bg-muted text-foreground rounded-lg">
        EN
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">EN</span>
      </div>
    );
  }

  const handleLanguageChange = (lang: string) => {
    try {
      // Change language using i18next
      i18n.changeLanguage(lang);
      
      // Persist to localStorage
      localStorage.setItem('language_preference', lang);
      localStorage.setItem('selectedLanguage', lang);
      localStorage.setItem('i18nextLng', lang);
      localStorage.setItem('i18n', JSON.stringify({ lng: lang }));
      
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = lang;
      
      // Trigger RTL/LTR direction
      const rtlLanguages = ['ar', 'ur', 'he'];
      document.dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
      
      onLanguageChange?.(lang);
      setIsOpen(false);
      console.log('Language changed to:', lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (compact) {
    return (
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-2 py-1 text-xs bg-muted text-foreground border border-primary/30 rounded-lg hover:border-primary/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
        title="Select Language"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    );
  }

  const currentLangName = languages[i18n.language] || 'English';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 hover:border-primary/60 bg-card text-foreground transition-all hover:shadow-md"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{currentLangName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-primary/30 rounded-lg shadow-lg w-56 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            {Object.entries(languages).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left rounded-md transition-all text-sm ${
                  i18n.language === code
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="flex-1">{name}</span>
                {i18n.language === code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
