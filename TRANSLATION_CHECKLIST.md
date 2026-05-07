# Remaining Pages - Translation Checklist

## Priority 1: Core User-Facing Pages

### 1. Marketplace Page
**File**: `src/pages/Marketplace.tsx`
**Item Type**: Product browsing, filtering, search

**Strings to Translate**:
- [ ] Page title (e.g., "Marketplace", "Browse Products")
- [ ] Search bar placeholder (use `t('search')`)
- [ ] "Sort by" label and options (use `t('sort')`)
- [ ] "Filter" section header (use `t('filter')`)
  - Filter options: Category, Price, Rating, availability
- [ ] "Category" filter label (use `t('category')`)
- [ ] "Price Range" label (use `t('price')`)
- [ ] "Product Name" (use `t('productName')`)
- [ ] "Price" (use `t('price')`)
- [ ] "Quantity" (use `t('quantity')`)
- [ ] "Add to Cart" button (use `t('addToCart')`)
- [ ] "View Details" link (use `t('details')`)
- [ ] "In Stock" / "Out of Stock" (use `t('stock')`)
- [ ] Empty state: "No products found" (use `t('noSearchResults')`)
- [ ] Loading state: "Loading..." (use `t('loading')`)

**Translation Keys Needed**:
```
marketplace, search, sort, filter, category, price, quantity, 
productName, addToCart, details, inStock, noSearchResults, loading
```

---

### 2. Orders Page
**File**: `src/pages/Orders.tsx`
**Item Type**: Order listing, status tracking, management

**Strings to Translate**:
- [ ] Page title (e.g., "My Orders", "Orders")
- [ ] Table headers:
  - "Order ID" (use `t('orderId')`)
  - "Date" (use `t('date')`)
  - "Total" (use `t('total')`)
  - "Status" (use `t('status')`)
  - "Actions" (use `t('actions')`)
- [ ] Status badges:
  - "Pending" (use `t('pending')`)
  - "Processing" / "In Progress" (use `t('inProgress')`)
  - "Completed" (use `t('completed')`)
  - "Cancelled" (use `t('cancelled')`)
  - "Shipped" (use `t('shipment')`)
- [ ] Action buttons:
  - "Track Order" / "View Details" (use `t('details')`)
  - "Cancel Order" (use `t('delete')`)
- [ ] Empty state: "No orders found" (use `t('noData')`)
- [ ] "Filter" dropdown (use `t('filter')`)
- [ ] "Export" button (use `t('exportData')`)

**Translation Keys Needed**:
```
orders, orderId, date, total, status, pending, inProgress, completed, 
cancelled, shipment, details, delete, noData, filter, exportData
```

---

### 3. Chat Page
**File**: `src/pages/Chat.tsx` or `src/pages/ChatPage.tsx`
**Item Type**: Messaging, communication

**Strings to Translate**:
- [ ] Page title (e.g., "Chat", "Messages")
- [ ] Sidebar:
  - "Online Users" header (use `t('onlineUsers')`)
  - User list labels
  - Search users input (use `t('search')`)
- [ ] Main chat area:
  - "No Messages Yet" placeholder (use `t('noMessagesYet')`)
  - "Start Chatting" prompt (use `t('startChatting')`)
  - Timestamp labels (use `t('time')`)
  - "Today", "Yesterday" date separators
- [ ] Message input:
  - Placeholder text: "Type a message..." (use `t('typeMessage')`)
  - "Send" button (use `t('send')`)
- [ ] Message actions:
  - "Reply" button (use `t('reply')`)
  - "Delete" option (use `t('delete')`)
  - "React" / "Emoji" options
- [ ] File upload:
  - "Upload" button (use `t('upload')`)
  - File types: Image, Video, Document (use `t('image')`, `t('video')`, `t('document')`)
  - "Drag & Drop" helper text (use `t('dragDropFiles')`)
- [ ] Loading state (use `t('loading')`)

**Translation Keys Needed**:
```
chat, onlineUsers, search, noMessagesYet, startChatting, time, typeMessage, 
send, reply, delete, upload, image, video, document, dragDropFiles, loading
```

---

### 4. Profile Page
**File**: `src/pages/Profile.tsx`
**Item Type**: User information, settings, preferences

**Strings to Translate**:
- [ ] Page title (e.g., "Profile", "My Profile")
- [ ] Profile section:
  - "Edit Profile" button (use `t('editProfile')`)
  - "Full Name" label (use `t('fullName')`)
  - "Email Address" label (use `t('emailAddress')`)
  - "Phone Number" label (use `t('phoneNumber')`)
  - "Country" label (use `t('country')`)
  - "Role" label (use `t('role')`)
- [ ] Business Info section:
  - "Business Information" header (use `t('businessInfo')`)
  - "Company Name" label (use `t('company')`)
  - "Type" / "Category" (use `t('category')`)
  - Farming/agricultural details labels
- [ ] Verification section:
  - "Verification Status" header (use `t('verificationStatus')`)
  - Status badges: "Verified", "Not Verified", "Pending Approval" (use `t('verified')`, `t('notVerified')`, `t('pendingApproval')`)
  - "Upload Documents" button (use `t('uploadDocument')`)
- [ ] Password section:
  - "Change Password" button (use `t('changePassword')`)
  - "Current Password" label (use `t('currentPassword')`)
  - "New Password" label (use `t('newPassword')`)
  - "Confirm Password" label (use `t('confirmNewPassword')`)
  - "Update Password" button (use `t('updatePassword')`)
- [ ] Form buttons:
  - "Save" / "Save Changes" (use `t('save')`)
  - "Cancel" (use `t('cancel')`)

**Translation Keys Needed**:
```
profile, editProfile, fullName, emailAddress, phoneNumber, country, role, 
businessInfo, company, category, verificationStatus, verified, notVerified, 
pendingApproval, uploadDocument, changePassword, currentPassword, newPassword, 
confirmNewPassword, updatePassword, save, cancel
```

---

## Priority 2: Transaction Pages

### 5. Payments Page
**File**: `src/pages/Payments.tsx`
**Item Type**: Payment methods, transactions

**Strings to Translate**:
- [ ] Page title (e.g., "Payments", "Payment Methods")
- [ ] Payment method selection:
  - "Select Payment Method" label (use `t('selectPaymentMethod')`)
  - Bank Transfer (use `t('bankTransfer')`)
  - Credit Card (use `t('creditCard')`)
  - Debit Card (use `t('debitCard')`)
  - UPI (use `t('upi')`)
- [ ] Payment form:
  - "Amount" label (use `t('amount')`)
  - "Enter Amount" placeholder (use `t('enterAmount')`)
  - "Total" display (use `t('total')`)
- [ ] Transaction buttons:
  - "Confirm Payment" (use `t('submit')`)
  - "Cancel" (use `t('cancel')`)
- [ ] Transaction history:
  - "Transaction Date" (use `t('date')`)
  - "Payment Status" (use `t('status')`)
  - Status values: "Completed", "Pending", "Failed"
- [ ] Confirmation messages:
  - "Payment Successful" (use `t('success')`)
  - "Payment Failed" (use `t('error_occurred')`)

**Translation Keys Needed**:
```
payment, selectPaymentMethod, bankTransfer, creditCard, debitCard, upi, 
amount, enterAmount, total, submit, cancel, date, status, success, error_occurred
```

---

### 6. Shipment Page
**File**: `src/pages/Shipment.tsx`
**Item Type**: Shipping, delivery tracking

**Strings to Translate**:
- [ ] Page title (e.g., "Shipment", "Track Order")
- [ ] Shipment tracking:
  - "Tracking ID" label (use `t('trackingId')`)
  - Enter tracking ID input (use `t('trackingId')`)
  - "Track" button (use `t('search')`)
- [ ] Shipment details:
  - "Carrier" label (use `t('carrier')`)
  - "Estimated Delivery" label (use `t('estimatedDelivery')`)
  - "Delivery Address" label (use `t('deliveryAddress')`)
  - "Status" label (use `t('status')`)
- [ ] Shipment status timeline:
  - "Order Placed" (use `t('pending')`)
  - "Processing" (use `t('inProgress')`)
  - "Shipped" (use `t('shipment')`)
  - "Delivered" (use `t('completed')`)
- [ ] Shipment info:
  - "Package Weight" 
  - "Delivery Attempts"
  - "Expected Delivery Date" (use `t('estimatedDelivery')`)
- [ ] Actions:
  - "Reschedule Delivery"
  - "Contact Carrier" (use `t('contact')`)
- [ ] Empty state: "No shipments" (use `t('noData')`)

**Translation Keys Needed**:
```
shipment, trackingId, search, carrier, estimatedDelivery, deliveryAddress, 
status, pending, inProgress, completed, contact, noData
```

---

## Priority 3: Admin & Special Pages

### 7. Admin Panel / Admin Products
**File**: `src/pages/AdminPanel.tsx` or `src/pages/AdminUpdateProducts.tsx`
**Item Type**: Admin management, product administration

**Strings to Translate**:
- [ ] Page title (e.g., "Admin Panel", "Manage Products")
- [ ] Product table headers:
  - "Product ID" (use `t('productName')`)
  - "Name" (use `t('name')`)
  - "Price" (use `t('price')`)
  - "Stock" (use `t('productStock')`)
  - "Category" (use `t('category')`)
  - "Status" (use `t('status')`)
  - "Actions" (use `t('actions')`)
- [ ] Action buttons:
  - "Add Product" (use `t('addProduct')`)
  - "Edit Product" (use `t('editProduct')`)
  - "Delete Product" (use `t('delete')`)
  - "View Details" (use `t('details')`)
- [ ] Product form fields:
  - "Product Name" (use `t('productName')`)
  - "Description" (use `t('description')`)
  - "Price" (use `t('productPrice')`)
  - "Category" (use `t('productCategory')`)
  - "Stock" (use `t('productStock')`)
  - "Upload Image" (use `t('uploadImage')`)
- [ ] User management (if applicable):
  - "All Users" (use `t('allUsers')`)
  - "Role" (use `t('role')`)
  - "Verification Status" (use `t('verificationStatus')`)
- [ ] Data operations:
  - "Export Data" (use `t('exportData')`)
  - "Import Data" (use `t('importData')`)
  - "Clear Filters" (use `t('clearFilters')`)
- [ ] Status indicators:
  - "Approved" (use `t('approved')`)
  - "Pending Approval" (use `t('pendingApproval')`)
  - "Rejected" (use `t('rejected')`)
- [ ] Confirmation dialogs:
  - "Confirm Delete" (use `t('confirmDelete')`)
  - "Are you sure?" (use `t('confirmDelete')`)
- [ ] Success messages:
  - "Created Successfully" (use `t('createdSuccessfully')`)
  - "Updated Successfully" (use `t('updatedSuccessfully')`)
  - "Deleted Successfully" (use `t('deletedSuccessfully')`)

**Translation Keys Needed**:
```
admin, addProduct, editProduct, productName, description, productPrice, 
productCategory, productStock, uploadImage, allUsers, role, verificationStatus, 
exportData, importData, clearFilters, approved, pendingApproval, rejected, 
confirmDelete, createdSuccessfully, updatedSuccessfully, deletedSuccessfully
```

---

### 8. Verification Page
**File**: `src/pages/Verification.tsx`
**Item Type**: Identity/business verification

**Strings to Translate**:
- [ ] Page title (e.g., "Verification", "Account Verification")
- [ ] Status display:
  - "Verification Status" (use `t('verificationStatus')`)
  - "Verified" (use `t('verified')`)
  - "Not Verified" (use `t('notVerified')`)
  - "Pending Approval" (use `t('pendingApproval')`)
- [ ] Document upload section:
  - "Upload Documents" (use `t('uploadDocument')`)
  - "Drag & drop files here" (use `t('dragDropFiles')`)
  - "Or select file" (use `t('selectFile')`)
  - Supported types: Image, Document (use `t('image')`, `t('document')`)
- [ ] Verification requirements:
  - "Required Documents:"
  - Document list (Business registration, Tax ID, etc.)
- [ ] Business info:
  - "Business Name" (use `t('company')`)
  - "Business Type" (use `t('category')`)
  - "Registration Number"
  - "Tax ID"
- [ ] Submitted items list:
  - "Submitted Documents"
  - "Status" (use `t('status')`)
  - "Submitted Date" (use `t('date')`)
- [ ] Action buttons:
  - "Submit for Review" (use `t('submit')`)
  - "Re-upload Documents" (use `t('upload')`)
  - "View Details" (use `t('details')`)
- [ ] Messages:
  - "Please wait" / "Under Review" (use `t('pleaseWait')`)
  - "Verification Complete" (use `t('completed')`)
  - "Verification Failed" (use `t('error_occurred')`)

**Translation Keys Needed**:
```
verification, verificationStatus, verified, notVerified, pendingApproval, 
uploadDocument, dragDropFiles, selectFile, image, document, company, category, 
status, date, submit, upload, details, pleaseWait, completed, error_occurred
```

---

### 9. AI Assistant
**File**: `src/pages/AIAssistant.tsx`
**Item Type**: AI chat interface

**Strings to Translate**:
- [ ] Page title (e.g., "AI Assistant")
- [ ] Chat area:
  - "No Messages Yet" (use `t('noMessagesYet')`)
  - "Start Chatting" prompt (use `t('startChatting')`)
  - Message timestamp (use `t('time')`)
- [ ] Input area:
  - Send button (use `t('send')`)
  - Message input placeholder (use `t('typeMessage')`)
- [ ] Example prompts or suggestions:
  - "How to improve crop yield?"
  - "Market price for [product]"
  - etc.
- [ ] Suggestions/quick actions:
  - Example suggestion labels
- [ ] Loading state:
  - "AI is thinking..." (use `t('loading')`)
  - "Please wait" (use `t('pleaseWait')`)
- [ ] Error messages:
  - "Failed to get response" (use `t('error_occurred')`)
  - "Try again" (use `t('tryAgain')`)
- [ ] Chat history:
  - "Clear Chat" (use `t('delete')`)
  - "Export Chat" (use `t('exportData')`)

**Translation Keys Needed**:
```
aiAssistant, noMessagesYet, startChatting, time, typeMessage, send, loading, 
pleaseWait, error_occurred, tryAgain, delete, exportData
```

---

## Implementation Order Recommendation

1. **Week 1**:
   - [ ] Marketplace (high traffic, many filters)
   - [ ] Orders (status-heavy, commonly used)

2. **Week 2**:
   - [ ] Chat (messaging, important for engagement)
   - [ ] Profile (user settings, account management)

3. **Week 3**:
   - [ ] Payments (transaction-critical)
   - [ ] Shipment (tracking, delivery info)

4. **Week 4**:
   - [ ] Admin Panel (operational efficiency)
   - [ ] Verification (account verification)
   - [ ] AI Assistant (intelligent features)

---

## Quick Summary by Component Count

| Page | Approx. Strings | Estimated Time |
|------|-----------------|-----------------|
| Marketplace | 15-20 | 30 min |
| Orders | 12-15 | 25 min |
| Chat | 14-18 | 30 min |
| Profile | 18-22 | 40 min |
| Payments | 12-15 | 25 min |
| Shipment | 14-18 | 30 min |
| Admin Panel | 20-25 | 45 min |
| Verification | 16-20 | 35 min |
| AI Assistant | 10-14 | 20 min |
| **TOTAL** | **131-167** | **~4.5 hours** |

---

## Notes

- All component files are in `src/pages/` or `src/components/`
- Import statement to add: `import { useTranslation } from 'react-i18next';`
- Hook to add: `const { t } = useTranslation();`
- Use existing keys from `src/languages/en.json` when possible
- Add only new keys when needed (to all 3 language files)
- Test immediately with language switcher after each page update

---

**Last Updated**: Today
**Total Pages to Translate**: 9
**Current Progress**: 3/12 (25%)
