# i18n Quick Reference Guide

## 🎯 Quick Start

### Import in your component
```tsx
import { useTranslation } from 'react-i18next';
```

### Use translations
```tsx
const { t } = useTranslation();
return <h1>{t('login')}</h1>;
```

---

## 📋 Common Patterns

### Pattern 1: Simple Text Translation
```tsx
const { t } = useTranslation();
<p>{t('welcome')}</p>
```

### Pattern 2: Dynamic Values
```tsx
// In JSON: "greeting": "Hello {{name}}"
<p>{t('greeting', { name: 'John' })}</p>
```

### Pattern 3: Conditional Translation
```tsx
const { t } = useTranslation();
return isLoggedIn ? t('welcome') : t('login');
```

### Pattern 4: Using i18n instance for language switching
```tsx
const { i18n } = useTranslation();
const changeLanguage = (lang) => i18n.changeLanguage(lang);
```

### Pattern 5: Get current language
```tsx
const { i18n } = useTranslation();
console.log(i18n.language); // Returns: 'en', 'ta', 'hi'
```

### Pattern 6: Plural rules (future)
```tsx
// In JSON: "items": "{{count}} item", "items_plural": "{{count}} items"
<p>{t('items', { count: 5 })}</p>
```

---

## 🛠️ File Locations

| File | Purpose |
|------|---------|
| `src/i18n.ts` | Main i18n configuration |
| `src/languages/en.json` | English translations |
| `src/languages/ta.json` | Tamil translations |
| `src/languages/hi.json` | Hindi translations |
| `src/components/LanguageSelectorUI.tsx` | Dropdown language selector |
| `src/components/LanguageSelectionScreen.tsx` | First-time language selection |
| `src/components/LanguageInitializer.tsx` | Wrapper for auto-detection |
| `src/hooks/useLanguageInitialization.ts` | Language initialization logic |

---

## 📱 Components

### LanguageSelectorUI
Dropdown button to switch languages
```tsx
import LanguageSelectorUI from './components/LanguageSelectorUI';

<LanguageSelectorUI />
```

### LanguageSelectionScreen
Full-screen language selection (first time)
```tsx
import LanguageSelectionScreen from './components/LanguageSelectionScreen';

<LanguageSelectionScreen onLanguageSelect={(lang) => console.log(lang)} />
```

### LanguageInitializer
Wrapper that shows language screen on first login
```tsx
import LanguageInitializer from './components/LanguageInitializer';

<LanguageInitializer requiresLanguageSelection={isFirstLogin}>
  <App />
</LanguageInitializer>
```

---

## 🎨 Adding Translations

### Step 1: Add to JSON files
```json
// en.json
{ "myFeature": "My Feature Text" }

// ta.json
{ "myFeature": "என் அம்சம் உரை" }

// hi.json
{ "myFeature": "मेरी सुविधा पाठ" }
```

### Step 2: Use in component
```tsx
const { t } = useTranslation();
<h1>{t('myFeature')}</h1>
```

---

## 🔄 Language Detection Order

1. **localStorage** - User's saved preference
2. **Browser language** - Auto-detected from browser settings
3. **Fallback** - English (en)

**Storage Key**: `i18nextLng`

---

## ✅ Key Features

| Feature | How It Works |
|---------|------------|
| **Auto-detection** | Browser language detected on first visit |
| **Persistence** | Selected language saved in localStorage |
| **Real-time** | Instant language change throughout app |
| **Multiple Languages** | English, Tamil, Hindi (easily expandable) |
| **TypeScript** | Full type safety |
| **No Page Reload** | Seamless language switching |

---

## 🚀 Usage in Your Pages

### In LoginPage.tsx
```tsx
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('login')}</h1>
      <label>{t('email')}</label>
      <button>{t('submit')}</button>
    </div>
  );
}
```

### In Chat.tsx
```tsx
const { t } = useTranslation();

return (
  <div>
    <h2>{t('messages')}</h2>
    <input placeholder={t('typeMessage')} />
    <button>{t('sendMessage')}</button>
  </div>
);
```

### In Dashboard.tsx
```tsx
const { t, i18n } = useTranslation();

return (
  <div>
    <h1>{t('dashboard')}</h1>
    <p>Language: {i18n.language}</p>
  </div>
);
```

---

## 🔍 Debugging

### Check if i18n is initialized
```tsx
import i18n from './i18n';
console.log(i18n.isInitialized); // Should be true
```

### See all available keys
```tsx
import enTranslations from './languages/en.json';
console.log(Object.keys(enTranslations));
```

### Check current language
```tsx
const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
console.log('All available languages:', i18n.languages);
```

### Debug localStorage
```tsx
// Check saved language
console.log(localStorage.getItem('i18nextLng'));
console.log(localStorage.getItem('selectedLanguage'));
console.log(localStorage.getItem('hasSelectedLanguage'));
```

---

## ❌ Common Mistakes

### ❌ Forgetting useTranslation import
```tsx
// WRONG
<h1>{t('home')}</h1>

// RIGHT
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
return <h1>{t('home')}</h1>;
```

### ❌ Missing translation key
```tsx
// WRONG - Key doesn't exist in JSON
{t('nonExistentKey')} // Shows: "nonExistentKey"

// RIGHT - Add key to all language JSON files first
```

### ❌ Not initializing i18n in main.tsx
```tsx
// WRONG
import App from './App';

// RIGHT
import './i18n'; // Must import first!
import App from './App';
```

### ❌ Typo in language codes
```tsx
// WRONG
i18n.changeLanguage('tamil'); // Use 'ta' not 'tamil'

// RIGHT
i18n.changeLanguage('ta');
```

---

## 📊 Available Translation Keys

### Authentication
- `login`, `signup`, `logout`
- `email`, `password`, `confirmPassword`
- `forgotPassword`, `rememberMe`

### Navigation
- `home`, `dashboard`, `profile`
- `products`, `orders`, `messages`

### E-commerce
- `cart`, `checkout`, `payment`
- `addToCart`, `removeFromCart`
- `order`, `orderDetails`, `orderStatus`

### Chat
- `chat`, `messages`, `sendMessage`
- `typeMessage`, `onlineUsers`, `offlineUsers`

### Admin
- `admin`, `farmer`, `buyer`

### Actions
- `save`, `delete`, `edit`, `update`
- `search`, `proceed`, `cancel`

### Status
- `loading`, `error`, `success`, `warning`
- `noData`, `noResults`

See `src/languages/en.json` for complete list.

---

## 📚 Resources

- i18next docs: https://www.i18next.com/
- react-i18next: https://react.i18next.com/
- Full setup guide: See `I18N_SETUP.md`
- Integration examples: See `INTEGRATION_EXAMPLES.tsx`

---

## 🎓 Next Steps

1. ✅ Setup complete
2. Import components in your pages
3. Replace hardcoded text with `t('key')`
4. Add new translation keys as needed
5. Test language switching

Happy translating! 🌍
