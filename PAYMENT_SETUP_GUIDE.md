# Firebase UPI Payment Confirmation System

Complete React + Firebase implementation for direct UPI payment confirmation with automatic order creation.

## 🎯 Features

✅ UPI QR Code generation  
✅ Transaction ID/UTR validation  
✅ Firebase Firestore integration  
✅ Automatic payment & order creation  
✅ Success confirmation with redirect  
✅ Duplicate submission prevention  
✅ Error handling & validation  
✅ Responsive UI with tailwind + shadcn/ui  

---

## 📦 Files Created

### 1. **src/lib/firebase.ts** - Firebase Configuration
Initialize and export Firestore database and auth

### 2. **src/lib/paymentService.ts** - Payment Utilities
- `savePayment()` - Save payment to Firestore
- `createOrder()` - Create order after payment
- `processPaymentAndCreateOrder()` - Atomic payment + order process
- `validateTransactionId()` - Validate UTR/transaction ID
- `getBuyerPayments()` - Fetch buyer's payments
- `getBuyerOrders()` - Fetch buyer's orders

### 3. **src/pages/PaymentConfirmation.tsx** - Payment UI Component
Smart component that works as:
- Route: `/payment-confirmation?amount=5000`
- Component: Import and use with props

### 4. **.env.local** - Environment Variables
Firebase configuration (you fill this in)

---

## 🚀 Quick Setup

### Step 1: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Project Settings** (gear icon)
4. Copy your Web SDK configuration
5. Open `.env.local` and fill in:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Create Firestore Collections

1. In Firebase Console, go to **Firestore Database**
2. Create two collections:
   - **payments**
   - **orders**

3. (Optional) Set security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /payments/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Use in Your App

#### As a Route:
```tsx
// Already added to App.tsx
<Route path="/payment-confirmation" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />

// Link from your component:
<Link to="/payment-confirmation?amount=5000">Pay Now</Link>
```

#### As a Component (with props):
```tsx
import PaymentConfirmation from '@/pages/PaymentConfirmation';

<PaymentConfirmation 
  userId="user123"
  userEmail="buyer@example.com"
  amount={5000}
  paymentDescription="Order #ORD-123456"
/>
```

#### From Order Page:
```tsx
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const navigate = useNavigate();
  const totalAmount = 5000;

  const handlePayClick = () => {
    navigate(`/payment-confirmation?amount=${totalAmount}`);
  };

  return (
    <button onClick={handlePayClick}>
      Proceed to Payment
    </button>
  );
};
```

---

## 📝 API Reference

### `processPaymentAndCreateOrder()`

Complete payment flow in one function.

```typescript
import { processPaymentAndCreateOrder } from '@/lib/paymentService';

const { paymentId, orderId } = await processPaymentAndCreateOrder(
  'user_id',
  'user@example.com',
  5000,          // amount
  'TXN123456'    // transaction ID
);
```

**Returns:**
```typescript
{
  paymentId: string;  // Firebase payment document ID
  orderId: string;    // Firebase order document ID
}
```

**Throws:** Error with message if transaction ID is invalid or Firebase fails

---

### `validateTransactionId()`

Validate transaction ID format before submission.

```typescript
import { validateTransactionId } from '@/lib/paymentService';

const validation = validateTransactionId('TXN123456');

if (!validation.valid) {
  console.log(validation.error); // "Transaction ID must be 3-50 characters"
}
```

---

### `savePayment()`

Save payment directly to Firestore.

```typescript
import { savePayment } from '@/lib/paymentService';

const paymentId = await savePayment({
  buyerId: 'user123',
  buyerEmail: 'user@example.com',
  amount: 5000,
  transactionId: 'TXN123456',
  paymentMethod: 'upi',
  status: 'success',
  createdAt: new Date(),
});
```

**Firestore Document Structure:**
```json
{
  "buyerId": "user123",
  "buyerEmail": "user@example.com",
  "amount": 5000,
  "transactionId": "TXN123456",
  "paymentMethod": "upi",
  "status": "success",
  "createdAt": "2026-04-09T10:30:00.000Z"
}
```

---

### `createOrder()`

Create order after payment success.

```typescript
import { createOrder } from '@/lib/paymentService';

const orderId = await createOrder({
  buyerId: 'user123',
  buyerEmail: 'user@example.com',
  amount: 5000,
  paymentId: 'payment_doc_id',
  orderStatus: 'confirmed',
  createdAt: new Date(),
});
```

**Firestore Document Structure:**
```json
{
  "buyerId": "user123",
  "buyerEmail": "user@example.com",
  "amount": 5000,
  "paymentId": "PAY-abc123",
  "orderStatus": "confirmed",
  "createdAt": "2026-04-09T10:30:05.000Z",
  "productId": "optional_product_id",
  "quantity": 5,
  "shippingAddress": "optional_address"
}
```

---

### `getBuyerPayments()`

Fetch all payments for a buyer from Firestore.

```typescript
import { getBuyerPayments } from '@/lib/paymentService';

const payments = await getBuyerPayments('user123');
// Returns: Array of payment objects with IDs
```

---

### `getBuyerOrders()`

Fetch all orders for a buyer from Firestore.

```typescript
import { getBuyerOrders } from '@/lib/paymentService';

const orders = await getBuyerOrders('user123');
// Returns: Array of order objects with IDs
```

---

## 🎨 UI Components

### PaymentConfirmation Component Props

```typescript
interface PaymentConfirmationProps {
  userId?: string;           // User ID (auto-filled from auth context)
  userEmail?: string;        // User email (auto-filled from auth context)
  amount?: number;           // Amount in INR (default: 5000)
  paymentDescription?: string; // Display text on QR (default: "Payment of ₹X")
}
```

### UPI Details

```
UPI ID: 9789090920@okbizaxis
Company: Shastika Global Impex Pvt Ltd
```

(Edit in `src/pages/PaymentConfirmation.tsx` if needed)

---

## ✅ Workflow

1. **User navigates to payment page**
   - Via route: `/payment-confirmation?amount=5000`
   - Or via component: `<PaymentConfirmation amount={5000} />`

2. **User sees:**
   - UPI QR Code (scannable)
   - UPI ID to copy
   - Amount to pay
   - Instructions

3. **User:**
   - Opens UPI app
   - Scans QR or enters UPI ID
   - Pays the amount
   - Copies Transaction ID

4. **User enters Transaction ID**
   - Clicks "I Have Paid — Confirm Order"

5. **System validates & processes:**
   - Validates transaction ID format
   - Saves payment to Firestore
   - Creates order in Firestore
   - Shows success message
   - Redirects to `/orders`

6. **Payment stored in Firestore:**
```
/payments/{paymentId}
{
  buyerId: "user_id",
  buyerEmail: "user@example.com",
  amount: 5000,
  transactionId: "TXN123456",
  paymentMethod: "upi",
  status: "success",
  createdAt: timestamp
}
```

7. **Order stored in Firestore:**
```
/orders/{orderId}
{
  buyerId: "user_id",
  buyerEmail: "user@example.com",
  amount: 5000,
  paymentId: "payment_doc_id",
  orderStatus: "confirmed",
  createdAt: timestamp
}
```

---

## 🔒 Security Notes

1. **Environment Variables**: Never commit `.env.local` to git. Add to `.gitignore`
2. **Firestore Rules**: Use security rules to restrict read/write access
3. **Transaction ID**: Validated on client (you may want server-side verification too)
4. **User Auth**: Component is wrapped in `<ProtectedRoute>` (requires login)
5. **HTTPS**: Firebase requires HTTPS in production

---

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Ensure `.env.local` has all 6 Firebase config values
- Restart dev server: `npm run dev`

### "Firestore is not defined" error
- Check that `src/lib/firebase.ts` initializes `db` correctly
- Ensure collections "payments" and "orders" exist in Firestore

### "User information is missing" error
- User must be logged in (check `currentUser` in Zustand store)
- Login before accessing payment confirmation

### Transaction ID validation fails
- Must be 3-50 characters
- Must contain alphanumeric characters
- Check for spaces/special characters

### "processPaymentAndCreateOrder is not a function"
- Ensure correct import: `import { processPaymentAndCreateOrder } from '@/lib/paymentService'`

---

## 📊 Database Schema

### payments collection
```typescript
{
  id: string;              // Auto-generated by Firestore
  buyerId: string;         // User ID
  buyerEmail: string;      // User email
  amount: number;          // Amount in INR
  transactionId: string;   // UTR or transaction ID
  paymentMethod: "upi";    // Payment method
  status: "success";       // Payment status
  createdAt: Timestamp;    // Creation timestamp
}
```

### orders collection
```typescript
{
  id: string;              // Auto-generated by Firestore
  buyerId: string;         // User ID
  buyerEmail: string;      // User email
  amount: number;          // Order amount
  paymentId: string;       // Reference to payment
  orderStatus: "confirmed";// Order status
  createdAt: Timestamp;    // Creation timestamp
  productId?: string;      // Optional: product ID
  quantity?: number;       // Optional: quantity
  shippingAddress?: string;// Optional: shipping address
}
```

---

## 🚀 Next Steps

1. **Add order status tracking** in Firestore
2. **Implement payment verification** via UPI verification API
3. **Add email notifications** when payment received
4. **Create admin dashboard** to manage payments/orders
5. **Add order shipment tracking integration**
6. **Implement refunds mechanism**

---

## 📞 Support

For issues or questions about Firebase:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Create Firestore collections](https://firebase.google.com/docs/firestore/manage-data/add-data)

---

**Version**: 1.0  
**Last Updated**: April 9, 2026  
