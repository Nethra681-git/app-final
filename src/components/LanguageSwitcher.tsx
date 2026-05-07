import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Globe, Check } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Safety check for i18n
  if (!i18n || !i18n.language) {
    return null;
  }

  // All available languages with flags and native names
  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
    { code: "te", label: "తెలుగు", flag: "🇮🇳" },
    { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
    { code: "mr", label: "मराठी", flag: "🇮🇳" },
    { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
    { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    { code: "bn", label: "বাংলা", flag: "🇧🇩" },
    { code: "or", label: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    { code: "ur", label: "اردو", flag: "🇵🇰" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
  ];

  const changeLanguage = (lng: string) => {
    try {
      // Change language in i18n immediately
      i18n.changeLanguage(lng);
      
      // Persist to localStorage
      localStorage.setItem("selectedLanguage", lng);
      localStorage.setItem("i18nextLng", lng);
      localStorage.setItem("i18n", JSON.stringify({ lng }));
      
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = lng;
      
      // Close dropdown
      setIsOpen(false);
      
      // Trigger React re-render by updating document direction for RTL languages
      const rtlLanguages = ['ar', 'ur', 'he'];
      document.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
      
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-green-400/20 text-sm"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang.label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden w-56 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left rounded-md transition-all ${
                  i18n.language === lang.code
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1 text-sm">{lang.label}</span>
                {i18n.language === lang.code && (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}