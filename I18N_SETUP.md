# i18n Internationalization Setup Guide

## Overview
This project uses **i18next** and **react-i18next** for multi-language support with English, Tamil, and Hindi.

## File Structure
```
src/
├── i18n.ts                          # i18n configuration
├── languages/
│   ├── en.json                      # English translations
│   ├── ta.json                      # Tamil translations
│   └── hi.json                      # Hindi translations
├── components/
│   ├── LanguageSelectorUI.tsx       # Language dropdown selector
│   ├── LanguageSelectionScreen.tsx  # First-time language selection screen
│   └── LanguageInitializer.tsx      # Wrapper for language initialization
├── hooks/
│   └── useLanguageInitialization.ts # Hook for managing language selection
└── main.tsx                         # Updated to import i18n
```

## Setup Instructions

### 1. Already Installed
The required packages have already been installed:
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 2. Initialize i18n (Already Done)
The `i18n.ts` file is already configured with:
- Multi-language resources (EN, TA, HI)
- Automatic language detection
- localStorage persistence
- Browser language detection fallback

## Usage in Components

### Basic Usage with useTranslation Hook

```tsx
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('login')}</h1>
      <button>{t('signup')}</button>
      <p>{t('forgotPassword')}</p>
    </div>
  );
}
```

### Accessing i18n instance

```tsx
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <p>Current Language: {i18n.language}</p>
      <button onClick={() => handleChangeLanguage('en')}>English</button>
      <button onClick={() => handleChangeLanguage('ta')}>Tamil</button>
      <button onClick={() => handleChangeLanguage('hi')}>Hindi</button>
    </div>
  );
}
```

## Component Usage Examples

### 1. Using LanguageSelectorUI Component (Dropdown)

```tsx
import LanguageSelectorUI from './components/LanguageSelectorUI';

export default function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>My App</h1>
      <LanguageSelectorUI />
    </header>
  );
}
```

### 2. Using LanguageSelectionScreen (First Time)

```tsx
import LanguageSelectionScreen from './components/LanguageSelectionScreen';
import { useState } from 'react';

export default function OnboardingPage() {
  const [languageSelected, setLanguageSelected] = useState(false);

  if (!languageSelected) {
    return (
      <LanguageSelectionScreen 
        onLanguageSelect={(lang) => {
          setLanguageSelected(true);
          // Proceed to next step
        }}
      />
    );
  }

  return <div>Welcome to the app!</div>;
}
```

### 3. Using LanguageInitializer Wrapper

Wrap your app to show language selection on first login:

```tsx
// In App.tsx or main.tsx
import LanguageInitializer from './components/LanguageInitializer';
import App from './App';

export default function AppContent() {
  const isFirstLogin = !localStorage.getItem('hasSelectedLanguage');

  return (
    <LanguageInitializer requiresLanguageSelection={isFirstLogin}>
      <App />
    </LanguageInitializer>
  );
}
```

### 4. Using useLanguageInitialization Hook

```tsx
import { useLanguageInitialization } from './hooks/useLanguageInitialization';

export default function MyComponent() {
  const { 
    isLanguageSelected, 
    isLoading, 
    completeLanguageSelection,
    currentLanguage 
  } = useLanguageInitialization();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Current Language: {currentLanguage}</p>
      <p>Language Selected: {isLanguageSelected ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Adding New Translation Keys

### Step 1: Add to all language JSON files

**src/languages/en.json**
```json
{
  "myNewKey": "My Text"
}
```

**src/languages/ta.json**
```json
{
  "myNewKey": "என் உரை"
}
```

**src/languages/hi.json**
```json
{
  "myNewKey": "मेरा पाठ"
}
```

### Step 2: Use in component

```tsx
const { t } = useTranslation();
<h1>{t('myNewKey')}</h1>
```

## How It Works

### 1. Auto-Detection
- On first visit: Detects browser language
- On subsequent visits: Loads saved preference from localStorage

### 2. Manual Language Change
- Users can change language anytime using LanguageSelectorUI
- Selected language is saved to localStorage
- App instantly updates to new language

### 3. Storage
- Selected language stored at: `localStorage.selectedLanguage`
- First-time flag stored at: `localStorage.hasSelectedLanguage`

## Features

✅ **Multi-language Support**: English, Tamil, Hindi
✅ **Auto-Detection**: Detects user's browser language
✅ **Persistent Storage**: Saves user preference in localStorage
✅ **Real-time Switching**: Instant language change throughout app
✅ **Dropdown Selector**: Easy language selection component
✅ **First-time Screen**: Beautiful onboarding language selection
✅ **TypeScript Support**: Fully typed for safety

## Translation Keys Available

Common keys already added:
- Login/Auth: `login`, `signup`, `logout`, `password`, `email`
- Navigation: `home`, `products`, `orders`, `dashboard`, `profile`
- E-commerce: `cart`, `checkout`, `payment`, `orders`
- Chat: `chat`, `messages`, `sendMessage`, `onlineUsers`
- Admin: `admin`, `farmer`, `buyer`
- Actions: `save`, `delete`, `edit`, `update`, `search`
- Status: `loading`, `error`, `success`, `warning`

See `src/languages/en.json` for complete list.

## Troubleshooting

### Language not changing?
```tsx
// Make sure to call changeLanguage after changing
const { i18n } = useTranslation();
i18n.changeLanguage('ta');
localStorage.setItem('selectedLanguage', 'ta');
```

### Translations not loading?
1. Check file names are correct: `en.json`, `ta.json`, `hi.json`
2. Verify JSON syntax is valid
3. Make sure i18n is initialized before rendering: `import './i18n.ts'` in main.tsx

### localStorage not working?
- Make sure browser allows localStorage
- Test: `localStorage.setItem('test', 'value')`

## Advanced: Dynamic Translation Loading

You can add more languages by:

1. Create new JSON file: `src/languages/fr.json`
2. Import in `i18n.ts`:
```tsx
import frTranslations from './languages/fr.json';

const resources = {
  // ... existing
  fr: { translation: frTranslations },
};
```

3. Add to language selector in `LanguageSelectorUI.tsx`

## Next Steps

1. ✅ Basic setup is complete
2. Add more translation keys as needed
3. Update your components to use `useTranslation()` hook
4. Show `LanguageSelectionScreen` on first login
5. Add `LanguageSelectorUI` to header/settings

Happy translating! 🌍
