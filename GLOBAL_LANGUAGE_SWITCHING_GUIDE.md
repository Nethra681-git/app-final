# Global Language Switching Implementation Guide

## Overview
This guide explains the complete global language switching system implemented in the Shastika AgroConnect application. The system supports 14 languages and automatically updates all UI text throughout the application when a user changes the language.

---

## 📋 Supported Languages

| Code | Language | Native Name | Script |
|------|----------|------------|--------|
| `en` | English | English | Latin |
| `hi` | Hindi | हिन्दी | Devanagari |
| `ta` | Tamil | தமிழ் | Tamil |
| `te` | Telugu | తెలుగు | Telugu |
| `kn` | Kannada | ಕನ್ನಡ | Kannada |
| `ml` | Malayalam | മലയാളം | Malayalam |
| `mr` | Marathi | मराठी | Devanagari |
| `gu` | Gujarati | ગુજરાતી | Gujarati |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi |
| `bn` | Bengali | বাংলা | Bengali |
| `or` | Odia | ଓଡ଼ିଆ | Odia |
| `ur` | Urdu | اردو | Urdu (RTL) |
| `fr` | French | Français | Latin |
| `es` | Spanish | Español | Latin |

---

## 🏗️ Architecture

### Key Files

1. **`src/i18n.ts`** - i18next initialization with all 14 languages
2. **`src/locales/`** - Translation JSON files for each language
3. **`src/components/LanguageSwitcher.tsx`** - Global fixed language switcher dropdown
4. **`src/components/LanguageSelector.tsx`** - Inline language selector for header
5. **`src/hooks/useLanguage.ts`** - Custom hook for easy language management
6. **`src/lib/translationService.ts`** - Language utility functions

---

## 🚀 How It Works

### 1. **Language Detection & Initialization**

When the app loads, the system:

```typescript
// src/main.tsx
import "./i18n.ts"; // Initialize i18n BEFORE rendering app

createRoot(document.getElementById("root")!).render(<App />);
```

The i18n configuration:
- Detects user's language from localStorage
- Falls back to browser language (`navigator.language`)
- Defaults to English if no language is detected
- Automatically saves the selected language to localStorage

### 2. **Global Language Switching**

Two UI components allow users to change language:

#### A. **Global Fixed Switcher** (Top-right corner)
```typescript
import LanguageSwitcher from "./components/LanguageSwitcher";

// Added to AppLayout - always visible
<LanguageSwitcher />
```

Features:
- Floating fixed position (top-right)
- Shows all 14 languages with native names
- Current language highlighted with checkmark
- No page reload required
- Instantly updates entire app

#### B. **Inline Selector** (Header)
```typescript
<LanguageSelector compact={true} />
```

Features:
- Compact dropdown in header
- Integrated with page layout
- Same functionality as global switcher

### 3. **Language Storage & Persistence**

When language changes:
```typescript
localStorage.setItem("selectedLanguage", languageCode);
localStorage.setItem("i18nextLng", languageCode);
localStorage.setItem("i18n", JSON.stringify({ lng: languageCode }));
```

**Result:** Selected language persists across browser sessions

---

## 💻 Usage in Components

### ✅ Basic Usage with `useTranslation()`

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>{t('welcome')}</p>
      <button>{t('submit')}</button>
    </div>
  );
}
```

### ✅ Advanced Usage with `useLanguage()` Hook

```typescript
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageControls() {
  const { t, changeLanguage, currentLanguage, isLanguageLoaded } = useLanguage();
  
  if (!isLanguageLoaded) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>Current: {currentLanguage}</p>
      
      <button onClick={() => changeLanguage('hi')}>
        {t('language_hi')}
      </button>
    </div>
  );
}
```

### ✅ Using Translation Keys in All Components

**Always use translation keys, never hardcode text:**

```typescript
// ❌ WRONG - Hardcoded text
return <h1>Welcome to Dashboard</h1>;

// ✅ CORRECT - Using translation key
return <h1>{t('welcome')}</h1>;
```

---

## 📁 Translation Files Structure

Each language has a JSON file in `src/locales/`:

```
src/locales/
├── en.json      # English
├── hi.json      # Hindi
├── ta.json      # Tamil
├── te.json      # Telugu
├── kn.json      # Kannada
├── ml.json      # Malayalam
├── mr.json      # Marathi
├── gu.json      # Gujarati
├── pa.json      # Punjabi
├── bn.json      # Bengali
├── or.json      # Odia
├── ur.json      # Urdu
├── fr.json      # French
└── es.json      # Spanish
```

### Translation File Format

```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "marketplace": "Marketplace",
    "orders": "Orders",
    "payments": "Payments"
  },
  "ui": {
    "submit": "Submit",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "messages": {
    "welcome": "Welcome to Shastika AgroConnect",
    "error": "An error occurred"
  }
}
```

---

## 🔄 Real-time UI Updates

### How Immediate Re-rendering Works

1. **User selects language** → LanguageSwitcher dropdown
2. **`i18n.changeLanguage()` called** → Updates i18n instance
3. **React re-renders** → All components using `useTranslation()` automatically re-render
4. **All `t()` calls return new translations** → Entire UI updates instantly
5. **localStorage updated** → Language persists across sessions

### No Page Reload Needed

The system uses React's state management to trigger re-renders:
- ❌ Old approach: `window.location.reload()` (causes flicker)
- ✅ New approach: React re-renders on language change (smooth)

---

## 🌍 RTL (Right-to-Left) Language Support

For RTL languages like Urdu, the system automatically:

```typescript
const rtlLanguages = ['ar', 'ur', 'he'];
document.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
```

Updates:
- Document direction
- Text alignment
- Component layout
- Animation direction

---

## ✅ Supported UI Sections

The global language switching affects these sections:

### 🔤 Sidebar Navigation
- Dashboard
- Marketplace
- Orders
- Payments
- Shipment
- Chat
- AI Assistant
- Verification
- Profile
- Admin Panel

### 📊 Dashboard
- Statistics cards
- Quick actions
- Welcome message
- User information

### 🛍️ Marketplace
- Product cards
- Filters
- Search
- Sorting options

### 📦 Orders & Shipment
- Order status
- Tracking information
- Timeline labels

### 💳 Payments
- Payment methods
- Transaction history
- Receipt information

### 💬 Chat
- Message bubbles
- System messages
- User names

### 🤖 AI Assistant
- Chat interface
- Response text
- Button labels

### 👤 Profile
- User information
- Settings
- Preferences

### ⚙️ Admin Panel
- Product management
- User management
- Statistics

### 🔔 Notifications
- Notification text
- Action buttons
- Status messages

### 🎨 Buttons & Labels
- Submit, Cancel, Save
- Add, Edit, Delete
- Loading, Error messages
- Placeholders

---

## 📝 Adding New Translation Keys

### Step 1: Update All Language Files

For a new feature, add the key to ALL language files:

```json
// src/locales/en.json
{
  "newFeature": "New Feature Name"
}

// src/locales/hi.json
{
  "newFeature": "नई विशेषता का नाम"
}

// src/locales/ta.json
{
  "newFeature": "புதிய நிறுவனத்தின் பெயர்"
}

// ... repeat for all 14 languages
```

### Step 2: Use in Component

```typescript
const { t } = useTranslation();
return <h2>{t('newFeature')}</h2>;
```

### Step 3: Verify in Browser

1. Change language via LanguageSwitcher
2. Confirm text appears in new language
3. Check localStorage persistence

---

## 🛠️ Configuration

### i18n Configuration (`src/i18n.ts`)

```typescript
i18n.init({
  resources,              // All 14 language resources
  fallbackLng: 'en',      // Default to English
  ns: ['translation'],    // Namespace
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage']
  },
  interpolation: {
    escapeValue: false    // React handles escaping
  },
  react: {
    useSuspense: false    // Graceful fallback
  }
});
```

---

## 🐛 Debugging

### Check Current Language

```javascript
// In browser console
i18n.language  // Current language code
i18n.languages // Available languages
localStorage.getItem('i18nextLng')  // Stored preference
```

### Enable Debug Mode

```typescript
// src/i18n.ts
.init({
  debug: true,  // Set to true for console logs
  // ...
});
```

### Test Translation Loading

```typescript
import { useTranslation } from 'react-i18next';

export function DebugLanguage() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <p>Current: {i18n.language}</p>
      <p>Loaded: {i18n.languages.join(', ')}</p>
      <p>Test: {t('dashboard')}</p>
    </div>
  );
}
```

---

## ⚡ Performance Considerations

### Lazy Translation Loading
Currently all 14 languages are loaded at startup for instant switching.

For large applications, consider:
```typescript
// Load languages on-demand
i18n.changeLanguage(lng); // Auto-loads if not loaded
```

### Translation Caching
- localStorage caches language preference (~100 bytes)
- i18nextLng key stores selected language
- No external API calls - all translations bundled

### Bundle Size
- 14 translation files: ~50-100KB total
- Gzipped: ~10-20KB
- Minimal impact on bundle size

---

## 🚦 Common Patterns

### Conditional Translations

```typescript
// Using translation objects
const errorMessage = t(`errors.${errorCode}`);

// With parameters
const message = t('welcome', { name: 'John' });
// en.json: "welcome": "Hello {{name}}"
```

### Fallback Text

```typescript
// Automatically falls back to English if translation missing
const text = t('missingKey'); // Returns "missingKey" if not found
```

### Pluralization

```typescript
// en.json
{
  "item": "1 item",
  "item_plural": "{{count}} items"
}

const plural = t('item', { count: 5 }); // "5 items"
```

---

## 📊 Testing Checklist

- [ ] All 14 languages appear in LanguageSwitcher
- [ ] Selecting language changes entire UI
- [ ] No page reload occurs
- [ ] Language persists after refresh
- [ ] RTL languages display correctly
- [ ] All navigation links translate
- [ ] Dashboard cards translate
- [ ] Marketplace products translate
- [ ] Buttons and labels translate
- [ ] Notifications translate
- [ ] Error messages translate
- [ ] Mobile responsive language selector works

---

## 🔗 Related Files

- [i18n.ts](src/i18n.ts) - i18n initialization
- [LanguageSwitcher.tsx](src/components/LanguageSwitcher.tsx) - Global switcher
- [LanguageSelector.tsx](src/components/LanguageSelector.tsx) - Inline selector
- [useLanguage hook](src/hooks/useLanguage.ts) - Custom hook
- [translationService.ts](src/lib/translationService.ts) - Utilities

---

## 🎓 Best Practices

1. ✅ Always use translation keys instead of hardcoded text
2. ✅ Use dynamic keys for data-driven content
3. ✅ Keep translation files in sync across all languages
4. ✅ Use the `useLanguage()` hook for complex language logic
5. ✅ Test all languages regularly
6. ✅ Provide context for translators in JSON comments
7. ✅ Use namespaces for large translation files
8. ✅ Monitor translation coverage with tools

---

## 🤝 Integration Examples

### In a Card Component

```typescript
import { useTranslation } from 'react-i18next';

export function ProductCard({ product }) {
  const { t } = useTranslation();
  
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p className="price">{t('price')}: ₹{product.price}</p>
      <p className="stock">{t('inStock')}: {product.stock}</p>
      <button>{t('buyNow')}</button>
    </div>
  );
}
```

### In a Modal Component

```typescript
import { useTranslation } from 'react-i18next';

export function ConfirmModal({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  
  return (
    <dialog>
      <h2>{t('confirmation')}</h2>
      <p>{t('confirmMessage')}</p>
      <button onClick={onCancel}>{t('cancel')}</button>
      <button onClick={onConfirm}>{t('confirm')}</button>
    </dialog>
  );
}
```

---

## 📞 Support

For issues or questions about the language system:
1. Check the browser console for errors
2. Verify translation files are complete
3. Check localStorage for saved preferences
4. Test with different browsers
5. Clear browser cache and localStorage if needed

---

**Last Updated:** April 2026  
**Status:** ✅ Production Ready
