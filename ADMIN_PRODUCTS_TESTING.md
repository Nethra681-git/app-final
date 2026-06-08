# AdminProducts - Setup & Testing Guide

Complete guide for setting up test data and testing the AdminProducts page.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firestore Collection

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to **Firestore Database**
4. Click **Create Collection**
5. Collection name: `products`
6. Click **Auto ID** to let Firebase generate IDs
7. Click **Save**

### Step 2: Add Test Products

In Firestore console, add these test documents:

#### Product 1: Basmati Rice
```json
{
  "name": "Premium Basmati Rice",
  "price": 450,
  "category": "Rice",
  "description": "Long grain premium basmati rice, 1kg",
  "image": "https://via.placeholder.com/50",
  "updatedAt": "2026-04-09T10:00:00.000Z"
}
```

#### Product 2: Organic Wheat
```json
{
  "name": "Organic Wheat Grain",
  "price": 320,
  "category": "Grains",
  "description": "100% organic wheat, pesticide-free",
  "image": "https://via.placeholder.com/50",
  "updatedAt": "2026-04-09T10:00:00.000Z"
}
```

#### Product 3: Turmeric Powder
```json
{
  "name": "Pure Turmeric Powder",
  "price": 280,
  "category": "Spices",
  "description": "Ground turmeric, high curcumin content",
  "image": "https://via.placeholder.com/50",
  "updatedAt": "2026-04-09T10:00:00.000Z"
}
```

#### Product 4: Dal (Lentils)
```json
{
  "name": "Masoor Dal Red",
  "price": 180,
  "category": "Lentils",
  "description": "Red lentils, 1kg pack",
  "image": "https://via.placeholder.com/50",
  "updatedAt": "2026-04-09T10:00:00.000Z"
}
```

#### Product 5: Cumin Seeds
```json
{
  "name": "Whole Cumin Seeds",
  "price": 320,
  "category": "Spices",
  "description": "Premium quality cumin seeds",
  "image": "https://via.placeholder.com/50",
  "updatedAt": "2026-04-09T10:00:00.000Z"
}
```

### Step 3: Test Admin Access

1. Make sure you're logged in as admin
   - Email: `kim.swathi.07@gmail.com`
   - Password: `swathi123`
   
   OR ensure your current user has `role: "admin"` in the store

2. Navigate to: `http://localhost:5173/admin/products`

3. You should see all products loaded

---

## 🧪 Testing Checklist

### ✅ Page Load Test

```
□ Navigate to /admin/products
□ Page loads without errors
□ Products display in cards
□ Category filter buttons show
□ Summary stats display
□ No error messages visible
```

### ✅ Product Display Test

```
For each product, verify:
□ Product name displays
□ Product price displays (₹450)
□ Category badge shows
□ Updated date shows
□ Product image displays (if provided)
□ Edit button is visible
□ Cards are properly styled
```

### ✅ Category Filter Test

```
□ Click "All" button
  □ Shows all products
  □ Count is correct
  
□ Click "Rice" category
  □ Shows only rice products
  □ Count updates
  
□ Click "Spices" category
  □ Shows only spice products
  □ Count updates
  
□ Filter buttons highlight when selected
```

### ✅ Price Edit Test

```
For each product:
□ Click "Edit" button
  □ Edit mode activates
  □ Card highlights with ring
  □ Edit button disappears
  □ Input field appears with current price
  □ Save and Cancel buttons show
  □ Input receives focus
```

### ✅ Price Input Test

```
In edit mode, test inputs:
□ Change price to: 500
  □ Input accepts value
  □ No error shown
  
□ Try invalid inputs:
  □ Leave empty "" → Save → Error "Price cannot be empty"
  □ Enter "abc" → Save → Error "Price must be a number"
  □ Enter "-100" → Save → Error "Price must be greater than 0"
  □ Enter "0" → Save → Error "Price must be greater than 0"
  
□ Valid inputs:
  □ Enter "999.99" → No error
  □ Enter "1" → No error
  □ Enter "10000" → Error should NOT appear
```

### ✅ Save Price Test

```
For one product (e.g., Basmati Rice ₹450):
□ Click Edit
□ Change price to 550
□ Click Save button
  □ Button shows "Saving..." with spinner
  □ Button is disabled
  □ Input is disabled
  
□ After save completes:
  □ Loading spinner disappears
  □ Success message appears: "✓ Price updated successfully..."
  □ Toast notification shows
  □ Price updates to ₹550 in card
  □ Card unhighlights (ring removed)
  □ Back to view mode
  □ Edit button reappears
  
□ Verify Firestore updated:
  □ Go to Firebase Console → Firestore
  □ Open products collection
  □ Find the product document
  □ Check "price" field = 550
  □ Check "updatedAt" = current timestamp
```

### ✅ Cancel Edit Test

```
For another product:
□ Click Edit
□ Change price from 320 to 400
□ Click Cancel button
  □ Success message doesn't show
  □ Price reverts to original 320
  □ View mode restored
  □ Edit button reappears
  
□ Go to Firestore:
  □ Price still shows 320 (not updated)
```

### ✅ Multiple Edit Test

```
Test editing multiple products in sequence:
□ Edit Product A: 450 → 500
  □ Save
  □ Success
  
□ Edit Product B: 320 → 350
  □ Save
  □ Success
  
□ Edit Product C: 280 → 300
  □ Save
  □ Success
  
□ All three prices updated in Firestore
□ All three prices updated in local state
```

### ✅ Error Handling Test

```
Test error scenarios:
□ Force a validation error:
  □ Click Edit
  □ Leave price empty
  □ Click Save
  □ Error toast appears
  □ Price not updated in Firestore
  
□ Simulate network error (optional):
  □ Disable network in DevTools
  □ Try to save
  □ Error message appears
  □ Button re-enables for retry
```

### ✅ Admin Access Test

```
Test admin-only access:
□ Log out
□ Log back in as non-admin user
□ Try to navigate to /admin/products
  □ Redirected to /dashboard
  □ "Access Denied" message (if shown)
  
□ Log back in as admin
□ Can access /admin/products again
```

### ✅ Summary Stats Test

```
With 5 products (₹450, ₹320, ₹280, ₹180, ₹320):
□ Total Products: 5
□ Average Price: ₹310 (1550/5)
□ Total Value: ₹1,550

After editing one price (450→500):
□ Total Products: still 5
□ Average Price: ₹314 (1570/5)
□ Total Value: ₹1,570
□ All update automatically
```

### ✅ Dark Mode Test

```
□ Toggle dark mode (if implemented)
□ Cards display properly in dark mode
□ Text is readable
□ Buttons are visible
□ input fields are usable
□ Success/error messages visible
```

---

## 🔍 Console Debugging

Open browser DevTools (F12) to verify:

### Check Products Loaded
```javascript
// In console, should log:
// ✅ Fetched 5 products from Firestore
// Should show product list
```

### Check Price Update
```javascript
// In console, should log:
// ✅ Price updated for Premium Basmati Rice
```

### Check Firestore Connection
```javascript
// In console:
import { db } from '@/lib/firebase';
console.log(db); // Should show Firestore instance
```

---

## 📊 Sample Test Data SQL/JSON

For testing, use this bulk data:

```javascript
// Firebase Cloud Function (optional - for automated setup)
const setupTestData = async () => {
  const products = [
    {
      name: "Premium Basmati Rice",
      price: 450,
      category: "Rice",
      description: "Long grain premium basmati rice, 1kg"
    },
    {
      name: "Organic Wheat Grain",
      price: 320,
      category: "Grains",
      description: "100% organic wheat, pesticide-free"
    },
    {
      name: "Pure Turmeric Powder",
      price: 280,
      category: "Spices",
      description: "Ground turmeric, high curcumin content"
    },
    {
      name: "Masoor Dal Red",
      price: 180,
      category: "Lentils",
      description: "Red lentils, 1kg pack"
    },
    {
      name: "Whole Cumin Seeds",
      price: 320,
      category: "Spices",
      description: "Premium quality cumin seeds"
    }
  ];

  for (const product of products) {
    await addDoc(collection(db, 'products'), {
      ...product,
      updatedAt: new Date()
    });
  }
};
```

---

## 🎯 Expected Behavior

### Initial Load
- Page shows loading spinner
- After 1-2 seconds, products appear
- No errors in console

### Edit Flow
```
Click Edit → Input shows → User types → Click Save → Spinner → Success → View mode
```

### Cancel Flow
```
Click Edit → Input shows → Click Cancel → View mode → No changes saved
```

### Validation Flow
```
Click Save (empty) → Error toast → User fixes → Click Save → Success
```

---

## 🐛 Troubleshooting

### Products Not Loading
```
1. Check Firestore has "products" collection
2. Check collection has documents
3. Open DevTools Console
4. Look for error messages
5. Check .env.local has Firebase config
6. Restart dev server: npm run dev
```

### Edit Not Working
```
1. Check you're logged in as admin
2. Verify role is set to "admin"
3. Check Firestore rules allow writes
4. Look at console for updateDoc errors
5. Check product ID exists
```

### Price Not Saving
```
1. Check validation: price > 0 and is number
2. Check console for Firestore errors
3. Check network tab for failed requests
4. Verify Firestore connection
5. Try disabling adblocker
```

### Admin Access Denied
```
1. Check currentUser.role in console
2. Verify admin login is correct
3. Check Zustand store has currentUser
4. Verify ProtectedRoute/AdminRoute work
5. Try logging out and back in
```

---

## ✨ Advanced Testing

### Performance Testing
```
Add 100+ products to Firestore
Test with:
□ Load time < 3 seconds
□ Scroll performance smooth
□ Edit responsiveness
□ Save latency reasonable
```

### Concurrent Edits
```
Two browser tabs, different products:
□ Tab 1: Edit Product A, Save
□ Tab 2: Edit Product B, Save
□ Both update correctly
□ No race conditions
```

### Network Throttling
```
DevTools → Network → Throttle to "Slow 3G"
□ Loading state visible
□ Save shows spinner longer
□ Error handling works
```

---

## 📈 Test Report Template

```
AdminProducts Testing Report
Date: ___________
Tester: ___________

Test Results:
□ Page Load: PASS / FAIL
□ Product Display: PASS / FAIL
□ Category Filter: PASS / FAIL
□ Edit Feature: PASS / FAIL
□ Save Feature: PASS / FAIL
□ Validation: PASS / FAIL
□ Cancel Feature: PASS / FAIL
□ Admin Access: PASS / FAIL
□ Summary Stats: PASS / FAIL
□ Error Handling: PASS / FAIL
□ Dark Mode: PASS / FAIL

Issues Found:
1. _________
2. _________

Overall Status: PASS / FAIL
```

---

## 🚀 Production Checklist

Before deploying:

```
□ Test with 1000+ products
□ Test with slow network
□ Test error scenarios
□ Test admin access control
□ Test Firestore rules
□ Test on mobile devices
□ Test in different browsers
□ Check console for warnings
□ Verify Firestore backups
□ Document admin procedures
```

---

**Version**: 1.0  
**Updated**: April 9, 2026  
**Status**: Testing Guide Complete ✅
