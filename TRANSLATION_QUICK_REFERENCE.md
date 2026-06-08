# Translation Implementation Quick Reference

## Quick Copy-Paste Examples

### Example 1: Marketplace Page (Most Common Pattern)

**Before Translation** (Hardcoded):
```typescript
// src/pages/Marketplace.tsx
export const Marketplace = () => {
  return (
    <div>
      <h1>Search Products</h1>
      <input placeholder="Enter product name..." />
      <button>Search</button>
      <div>
        <label>Category:</label>
        <select>
          <option>All Categories</option>
        </select>
      </div>
      <button>Add to Cart</button>
    </div>
  );
};
```

**After Translation** (With i18n):
```typescript
import { useTranslation } from 'react-i18next';

export const Marketplace = () => {
  const { t } = useTranslation();  // ← Add this line
  
  return (
    <div>
      <h1>{t('advancedSearch')}</h1>
      <input placeholder={t('search')} />
      <button>{t('submit')}</button>
      <div>
        <label>{t('category')}:</label>
        <select>
          <option>{t('view')}</option>
        </select>
      </div>
      <button>{t('addToCart')}</button>
    </div>
  );
};
```

**Translation Keys Used**:
- `advancedSearch` = "Advanced Search" (en), "எதிர்ख்தना தேடல்" (ta), "उन्नत खोज" (hi)
- `search` = "Search" (en), "தேடுங்கள்" (ta), "खोज करें" (hi)
- `submit` = "Submit" (en), "சமர்ப्பிக்கவும்" (ta), "सबमिट करें" (hi)
- `category` = "Category" (en), "வரவம்" (ta), "श्रेणी" (hi)
- `addToCart` = "Add to Cart" (en), "கார்டில் சேர்க்கவும்" (ta), "कार्ट में जोड़ें" (hi)

---

### Example 2: Orders Status Display

**Before Translation**:
```typescript
<span className={`status-badge ${order.status}`}>
  {order.status === 'pending' ? 'Pending' : order.status === 'completed' ? 'Completed' : 'Cancelled'}
</span>
```

**After Translation**:
```typescript
import { useTranslation } from 'react-i18next';

const OrderComponent = () => {
  const { t } = useTranslation();
  
  return (
    <span className={`status-badge ${order.status}`}>
      {order.status === 'pending' ? t('pending') : 
       order.status === 'completed' ? t('completed') : 
       t('cancelled')}
    </span>
  );
};
```

**Translation Keys**:
- `pending` = "Pending"
- `completed` = "Completed"  
- `cancelled` = "Cancelled"

---

### Example 3: Form Labels (Profile Page)

**Before Translation**:
```typescript
<div className="form-group">
  <label>Full Name</label>
  <input type="text" placeholder="Enter your full name" />
  <label>Email Address</label>
  <input type="email" placeholder="Enter your email" />
  <label>Phone Number</label>
  <input type="tel" placeholder="Enter your phone" />
  <button>Save Changes</button>
</div>
```

**After Translation**:
```typescript
const { t } = useTranslation();

<div className="form-group">
  <label>{t('fullName')}</label>
  <input type="text" placeholder={t('fullName')} />
  <label>{t('emailAddress')}</label>
  <input type="email" placeholder={t('emailAddress')} />
  <label>{t('phoneNumber')}</label>
  <input type="tel" placeholder={t('phoneNumber')} />
  <button>{t('save')}</button>
</div>
```

---

## All Available Translation Keys

### Navigation & Pages (9 keys)
```
dashboard | marketplace | orders | payment | shipment | chat 
aiAssistant | verification | profile | admin
```

### Actions & Buttons (15+ keys)
```
add | edit | delete | update | save | submit | cancel | close
back | next | logout | loading | upload | download | send | reply
```

### Status Labels (6 keys)
```
pending | completed | cancelled | inProgress | approved | rejected
```

### Business Terms (20+ keys)
```
marketplace | shipment | aiAssistant | verification | notifications
company | farming | businessInfo | verificationStatus | verified | notVerified
addProduct | editProduct | productName | productPrice | productCategory | productStock
amount | paymentMethod | bankTransfer | creditCard | debitCard | upi
trackingId | carrier | estimatedDelivery | deliveryAddress
```

### Form Fields (15+ keys)
```
fullName | emailAddress | phoneNumber | country | role | password
confirmPassword | currentPassword | newPassword | name | email | phone
```

### UI & Messages (20+ keys)
```
loading | pleaseWait | error_occurred | success | tryAgain | noData
noResults | confirmDelete | deletedSuccessfully | updatedSuccessfully | createdSuccessfully
searchResults | noSearchResults | viewMore | showLess
```

### Date, Quantity, Details (10+ keys)
```
date | time | description | quantity | price | total | status
filter | sort | view | details
```

---

## Translation File Reference

### Adding New Keys

If you need a key that doesn't exist, add it to all 3 files:

**File**: `src/languages/en.json`
```json
{
  "existingKey": "Existing Value",
  "newKey": "New English Value"  // Add new key here
}
```

**File**: `src/languages/ta.json`
```json
{
  "existingKey": "தமிழ் மதிப்பு",
  "newKey": "புதிய தமிழ் மதிப்பு"  // Add Tamil translation here
}
```

**File**: `src/languages/hi.json`
```json
{
  "existingKey": "हिंदी मूल्य",
  "newKey": "नया हिंदी मूल्य"  // Add Hindi translation here
}
```

---

## Pattern Matching: Find All Hardcoded Strings

### Using VS Code Find

1. **Open Find & Replace**: `Ctrl+H` (Windows) or `Cmd+Option+F` (Mac)
2. **Search for hardcoded text patterns**:
   ```
   - "label": "Lorem"          // Find string assignments
   - <span>"    </span>        // Find JSX text
   - placeholder="text"        // Find attributes
   - aria-label="text"         // Find accessibility text
   ```

### Quick Checklist for Each Page
- [ ] Page titles and section headers
- [ ] Button labels
- [ ] Form labels and placeholders
- [ ] Status displays and badges
- [ ] Error messages and validation text
- [ ] Placeholder text in inputs
- [ ] Dropdown options
- [ ] Table column headers
- [ ] Empty state messages
- [ ] Helper text and descriptions

---

## Testing Your Translations

### Step 1: Implement Translations
Apply t() to all hardcoded strings in your component

### Step 2: Test English (en)
- Click language switcher → Select English
- Verify all text displays correctly
- Check for any missing keys (console warnings)

### Step 3: Test Tamil (ta)
- Click language switcher → Select Tamil - தமிழ்
- Verify all text translated to Tamil
- Check that Tamil characters display correctly
- Verify no English text remains (except company name, etc.)

### Step 4: Test Hindi (hi)
- Click language switcher → Select Hindi - हिंदी
- Verify all text translated to Hindi
- Check that Hindi characters display correctly
- Verify no English text remains

### Step 5: Test Persistence
- Switch to Tamil
- Refresh the page (F5 or Cmd+R)
- Verify Tamil text still displays (localStorage working)
- Switch to another page
- Verify language persists across pages

---

## Common Issues & Solutions

### Issue: Key shows up as "key_name" instead of translation
**Cause**: Translation key doesn't exist in language file
**Solution**: 
1. Check `src/languages/en.json` for the key
2. If missing, add to all three language files
3. Restart dev server

### Issue: English text still shows for Tamil/Hindi
**Cause**: Key not passed through t() function
**Solution**:
1. Find the hardcoded string in code
2. Wrap with t() function: `{t('keyName')}`
3. Verify key exists in language files

### Issue: Component doesn't re-render on language change
**Cause**: useTranslation hook not called or old data cached
**Solution**:
1. Ensure `const { t } = useTranslation();` is in component
2. Verify key is being used: `{t('key')}`
3. Clear browser cache and restart dev server

---

## File Locations Recap

```
src/
├── i18n.ts                              // Main i18n config
├── languages/
│   ├── en.json                          // English (150+ keys)
│   ├── ta.json                          // Tamil (150+ keys)
│   └── hi.json                          // Hindi (150+ keys)
├── components/
│   ├── LanguageSwitcher.tsx             // Language selector UI
│   └── AppLayout.tsx                    // ✅ Already translated
├── pages/
│   ├── Login.tsx                        // ✅ Already translated
│   ├── Dashboard.tsx                    // ✅ Already translated
│   ├── Marketplace.tsx                  // ⏳ Needs translation
│   ├── Orders.tsx                       // ⏳ Needs translation
│   ├── Chat.tsx                         // ⏳ Needs translation
│   ├── Profile.tsx                      // ⏳ Needs translation
│   ├── Payments.tsx                     // ⏳ Needs translation
│   ├── Shipment.tsx                     // ⏳ Needs translation
│   ├── AdminPanel.tsx                   // ⏳ Needs translation
│   ├── Verification.tsx                 // ⏳ Needs translation
│   └── AIAssistant.tsx                  // ⏳ Needs translation
└── main.tsx                             // ✅ Updated (imports i18n)
```

---

## Example: Complete Marketplace Translation

Here's what a fully translated Marketplace might look like:

```typescript
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';

const Marketplace = () => {
  const { t } = useTranslation();
  const { products } = useStore();
  const [filters, setFilters] = useState({ category: '', priceRange: [] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('marketplace')}</h1>
        <p className="text-muted-foreground">{t('availableProducts')}</p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <input 
          placeholder={t('search')} 
          className="flex-1"
        />
        <button className="btn-primary">{t('submit')}</button>
      </div>

      {/* Filter Section */}
      <div className="space-y-3">
        <label>{t('category')}</label>
        <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
          <option value="">{t('categories')}</option>
          {/* category options */}
        </select>
        
        <label>{t('price')}</label>
        <input type="range" placeholder={t('price')} />
        
        <div className="flex gap-2">
          <button className="flex-1">{t('apply')}</button>
          <button className="flex-1">{t('clearFilters')}</button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="text-sm">{product.description}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="font-bold">{t('price')}: ₹{product.price}</span>
              <span className="text-sm">{product.quantity} {t('quantity')}</span>
            </div>
            <button className="w-full mt-3 btn-primary">{t('addToCart')}</button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noSearchResults')}</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
```

All strings that should vary by language now use `t()` calls!

---

**Happy Translating! 🌍**
