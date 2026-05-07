// Translation service using a free translation API (Google Translate alternative)
// For production, use @google-cloud/translate with proper API key setup

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  fr: 'French',
  es: 'Spanish',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
  bn: 'Bengali',
  or: 'Odia',
  ur: 'Urdu',
};

/**
 * Translate text using MyMemory Translation API (free alternative)
 * For production use, integrate with Google Cloud Translate API
 */
export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> => {
  if (!text) return text;
  if (targetLang === 'en' || sourceLang === targetLang) return text;

  try {
    // Using MyMemory Translated API (free, no authentication needed)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );

    const data = await response.json();

    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }

    console.warn('Translation API returned status:', data.responseStatus);
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

/**
 * Batch translate multiple texts
 */
export const translateMultiple = async (
  texts: string[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string[]> => {
  return Promise.all(
    texts.map((text) => translateText(text, targetLang, sourceLang))
  );
};

/**
 * Get available languages
 */
export const getAvailableLanguages = () => LANGUAGE_MAP;

/**
 * Get language name from code
 */
export const getLanguageName = (code: string): string => {
  return LANGUAGE_MAP[code] || code;
};

/**
 * Initialize translation with custom API key (for Google Cloud Translate)
 * Usage:
 * const translator = new TranslationService('YOUR_API_KEY');
 * const result = await translator.translate('Hello', 'es');
 */
export class TranslationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en'
  ): Promise<string> {
    // For Google Cloud Translate integration
    // This would use: const translate = new Translate({ key: this.apiKey });
    // const [translation] = await translate.translate(text, targetLang);
    // return translation;

    // Currently using free API as fallback
    return translateText(text, targetLang, sourceLang);
  }
}
