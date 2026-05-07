# Language Switching System - Testing & Verification Guide

## 🧪 How to Verify the System is Working

### 1. Open Developer Tools
Press `F12` or right-click → Inspect to open Developer Tools

### 2. Check localStorage
In the Console tab, run:
```javascript
localStorage.getItem('i18nextLng')
localStorage.getItem('selectedLanguage')
localStorage.getItem('i18n')
```

You should see the current language code (e.g., "en", "ta", "hi")

### 3. Test Language Switching
1. Click the language selector button (top-right corner)
2. Select a different language (e.g., Tamil)
3. Verify:
   - The UI updates instantly
   - localStorage keys update
   - The selected language shows with a checkmark
   - HTML document lang attribute changes

### 4. Verify Persistence
1. Change language to Tamil
2. Reload the page (F5 or Cmd+R)
3. App should load in Tamil (persisted from localStorage)
4. If you cleared localStorage, it should default to English

### 5. Test RTL (For Urdu)
1. Select Urdu language
2. Verify:
   - Text alignment changes to right-to-left
   - document.dir changes to "rtl"
   - Numbers and special characters display correctly

## 📋 Verification Checklist

### Core System
- [ ] LanguageSwitcher component appears (top-right fixed position)
- [ ] LanguageSelector dropdown in header works
- [ ] Language selection persists after page reload
- [ ] localStorage keys are updated correctly
- [ ] HTML lang attribute updates when language changes
- [ ] Browser console shows no i18n errors

### User-Facing Text
- [ ] Sidebar menu items are translated
- [ ] Page titles update when language changes
- [ ] Buttons show translated text
- [ ] Form labels change language
- [ ] Status labels translate (Pending, Confirmed, etc.)
- [ ] Error messages appear in selected language

### Performance
- [ ] No lag when switching languages
- [ ] Animations remain smooth
- [ ] No console errors during switch
- [ ] Chat messages don't re-load
- [ ] Notifications remain intact

## 🔍 Debugging Translation Issues

### Issue: Translation key shows instead of text
**Example:** Seeing `t('button_save')` instead of "Save"

**Solutions:**
1. Verify key exists in locale file
2. Check spelling matches exactly (case-sensitive)
3. Ensure `useTranslation()` hook imported
4. Check i18n.ts is initialized before rendering

### Issue: Language doesn't persist after reload
**Cause:** localStorage might be blocked

**Solutions:**
1. Check if localStorage is enabled
2. Check browser privacy settings
3. Ensure not in incognito/private mode
4. Check browser storage quota

### Issue: Some text not translating
**Cause:** Hardcoded string not using t()

**Solutions:**
1. Find the hardcoded text in component
2. Import useTranslation hook
3. Get t function: `const { t } = useTranslation();`
4. Replace string: `{t('button_name')}`
5. Ensure translation key exists in all locale files

### Issue: RTL layout broken for Urdu
**Cause:** document.dir not set or CSS not respecting it

**Solutions:**
1. Check languageSwitcher.tsx changeLanguage() function
2. Verify `document.dir = 'rtl'` is set
3. Check CSS doesn't use hardcoded float left/right
4. Test with flexbox or grid instead

## 🚀 Quick Start for Adding Translations

### Step 1: Find untranslated text in component
```typescript
// BAD - Hardcoded text
<button>Save</button>

// GOOD - Using translation
<button>{t('button_save')}</button>
```

### Step 2: Add translation key to en.json
```json
{
  "button_save": "Save",
  ...
}
```

### Step 3: Update component
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t('button_save')}</button>;
}
```

### Step 4: Add translations to other locales
For each locale file (ta.json, hi.json, etc.):
```json
{
  "button_save": "[Translated text]",
  ...
}
```

## 📊 Language Code Reference

```javascript
const languages = {
  'en': 'English',
  'ta': 'Tamil (தமிழ்)',
  'hi': 'Hindi (हिन्दी)',
  'te': 'Telugu (తెలుగు)',
  'kn': 'Kannada (ಕನ್ನಡ)',
  'ml': 'Malayalam (മലയാളം)',
  'mr': 'Marathi (मराठी)',
  'gu': 'Gujarati (ગુજરાતી)',
  'pa': 'Punjabi (ਪੰਜਾਬੀ)',
  'bn': 'Bengali (বাংলা)',
  'or': 'Odia (ଓଡିଆ)',
  'ur': 'Urdu (اردو)',
  'fr': 'French (Français)',
  'es': 'Spanish (Español)'
}
```

## 🔧 Common Translation Keys

### Navigation
```
dashboard, marketplace, orders, payments, shipment, 
chat, ai_assistant, verification, profile, logout, admin
```

### Buttons
```
button_save, button_cancel, button_send, button_submit,
button_back, button_delete, button_edit, button_update,
button_approve, button_reject, button_upload
```

### Status
```
status_pending, status_confirmed, status_shipped, status_delivered,
status_cancelled, status_verified, status_not_verified,
status_approved, status_rejected, status_active, status_inactive
```

### Messages
```
loading, saving, error, success, warning, info,
no_products, no_orders, no_payments, no_messages,
order_created, payment_success, shipment_created
```

### Form Fields
```
email, password, phone_number, full_name, name, role,
address, country, quantity, price, category, location
```

## 📈 Progress Tracking

### Phase 1: Core Setup ✅ COMPLETE
- [x] i18n configured
- [x] Language files created (en.json)
- [x] LanguageSwitcher component
- [x] LanguageSelector component
- [x] localStorage integration
- [x] i18n initialization
- [x] Persist language settings

### Phase 2: Translation Files (IN PROGRESS)
- [ ] Complete ta.json with all en.json keys
- [ ] Complete hi.json with all en.json keys
- [ ] Complete fr.json with all en.json keys
- [ ] Complete es.json with all en.json keys
- [ ] Complete remaining locales (te, kn, ml, mr, gu, pa, bn, or, ur)

### Phase 3: Component Updates (PARTIALLY DONE)
- [x] Update App.tsx with translations
- [x] Update Dashboard.tsx with translations
- [ ] Update Login.tsx
- [ ] Update AdminPanel.tsx
- [ ] Update Verification.tsx
- [ ] Update Profile.tsx
- [ ] Update ChatWindow.tsx
- [ ] Update Payments.tsx
- [ ] Update Orders.tsx
- [ ] Update FarmerDashboard.tsx
- [ ] Update all remaining pages

### Phase 4: Testing (PENDING)
- [ ] Language persistence on reload
- [ ] Instant UI update on change
- [ ] RTL for Urdu
- [ ] All 14 languages functional
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 💡 Pro Tips

1. **Use translation keys in component props:**
   ```typescript
   <StatCard label={t('totalProducts')} value="500" />
   ```

2. **For dynamic keys, use template literals:**
   ```typescript
   <span>{t(`status_${order.status}`)}</span>
   ```

3. **Use nested keys for organization:**
   ```json
   {
     "button": {
       "save": "Save",
       "cancel": "Cancel"
     }
   }
   ```
   ```typescript
   t('button.save')
   ```

4. **For parameters in translations:**
   ```json
   {
     "welcome_user": "Welcome, {{name}}"
   }
   ```
   ```typescript
   t('welcome_user', { name: 'John' })
   ```

5. **To pluralize translations:**
   ```json
   {
     "item_count_one": "1 item",
     "item_count_other": "{{count}} items"
   }
   ```
   ```typescript
   t('item_count', { count: 5 })
   ```

## 🆘 Need Help?

1. Check the browser console for errors
2. Verify translation key exists in locale files
3. Confirm useTranslation() imported and used correctly
4. Clear localStorage and refresh if stuck
5. Check that i18n.ts initializes before component renders

---

**System Status:** Core implementation complete ✅
**Translation Status:** English complete, other languages in progress
**Component Updates:** In progress (2/15+ files updated)

Last verified: 2026-04-20
