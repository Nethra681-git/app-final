# Razorpay Payment Integration Guide

## 📋 Overview

This guide covers the complete implementation of Razorpay payment integration in the Shastika AgroConnect application with secure backend verification.

### Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (Vite + TypeScript)│
└──────────┬──────────┘
           │
        HTTPS
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│  Express Backend    │◄────►│ Razorpay API     │
│  (Node.js)          │      │ (Payment Gateway)│
└─────────────────────┘      └──────────────────┘
           │
           │ (Secure)
           ▼
┌─────────────────────┐
│  Firebase Firestore │
│  (Payment Records)  │
└─────────────────────┘
```

---

## 🚀 QUICK START

### Prerequisites
- Node.js >= 18.0.0
- Razorpay account (https://razorpay.com)
- Backend and Frontend repositories

### 1. Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/signin)
2. Sign up or log in
3. Navigate to **Settings > API Keys**
4. Copy your **Test Mode** keys:
   - `Key ID` (starts with `rzp_test_`)
   - `Key Secret` (keep secret!)

> ⚠️ **Test Keys (Development)**
> - Key ID: `rzp_test_XXXXXXXXX`
> - Use for testing without real money

### 2. Backend Setup

```bash
cd server
cp .env.example .env.local
```

Edit `server/.env.local`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

Install dependencies:
```bash
npm install
```

Start backend:
```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔐 RAZORPAY_KEY_ID: ✓
🔐 RAZORPAY_KEY_SECRET: ✓
```

### 3. Frontend Setup

Create `.env.local` in project root:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
VITE_PAYMENT_API_URL=http://localhost:5000
```

> ⚠️ **Important**: Never put RAZORPAY_KEY_SECRET in frontend code!

---

## 💳 INTEGRATION EXAMPLES

### Example 1: Using RazorpayPayment Component

```tsx
import { RazorpayPayment } from '@/components/RazorpayPayment';

export function OrderCheckout() {
  const handlePaymentSuccess = (data) => {
    console.log('Payment successful:', data);
    // Redirect to order confirmation
  };

  return (
    <RazorpayPayment
      amount={5000}
      description="Order #ORD-123456"
      productId="prod_123"
      onSuccess={handlePaymentSuccess}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}
```

### Example 2: Direct Function Usage

```tsx
import { processRazorpayPayment } from '@/lib/razorpayService';

async function handlePayment() {
  try {
    const result = await processRazorpayPayment({
      amount: 5000,
      buyerId: 'user_123',
      buyerEmail: 'user@example.com',
      buyerName: 'John Doe',
      productId: 'prod_123',
      customNotes: {
        orderType: 'bulk',
        region: 'export',
      },
    });

    console.log('Payment successful:', result);
    // result = { paymentId: 'fire_doc_id', orderId: 'razorpay_order_id' }
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
}
```

### Example 3: Multiple Payments UI

```tsx
import { RazorpayPayment } from '@/components/RazorpayPayment';

export function MultipleOrders({ orders }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4">
          <h3>{order.productName}</h3>
          
          <RazorpayPayment
            amount={order.total}
            description={`${order.productName} - Order #${order.id}`}
            productId={order.productId}
            onSuccess={() => markOrderAsPaid(order.id)}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 TESTING IN RAZORPAY TEST MODE

### Test Cards

Use these test card numbers for testing:

| Card Type | Card Number | Expiry | CVV |
|-----------|------------|---------|-----|
| Visa | `4111 1111 1111 1111` | 12/25 | 123 |
| Mastercard | `5555 5555 5555 4444` | 12/25 | 456 |
| Amex | `3782 822463 10005` | 12/25 | 1234 |

### Test Flows

#### ✅ Successful Payment
1. Enter test card number
2. Enter any future expiry
3. Enter any 3-digit CVV
4. Click "Pay"
5. You'll see success page

#### ❌ Failed Payment
Use: `4000 0000 0000 0002` (appears valid but fails after submission)

#### ⏳ Authorization Pending
Use: `4000 1111 1111 1115` (will show pending state)

---

## 🔐 SECURITY ARCHITECTURE

### Frontend (Never Expose Secret)
```tsx
// ✅ CORRECT: Only use KEY_ID on frontend
const RazorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
// Result: rzp_test_XXXXXXXXX only

// ❌ WRONG: Never expose KEY_SECRET
// const secret = import.meta.env.RAZORPAY_KEY_SECRET; // DON'T DO THIS!
```

### Backend (Verify Signature)
```typescript
// Backend always verifies using SECRET
const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
const generated_signature = hmac.digest('hex');

// Compare signatures
if (generated_signature !== razorpay_signature) {
  throw new Error('Invalid payment - signature mismatch!');
}
```

### Why This Matters

1. **KEY_ID** (Public)
   - Used to create orders
   - Can be exposed in frontend
   - No security risk

2. **KEY_SECRET** (Private)
   - Used to verify signatures
   - MUST stay on backend only
   - If exposed, attacker can:
     - Create fraudulent orders
     - Forge payment receipts
     - Steal customer data

### Verification Flow

```
1. Frontend → Backend: Create order (with KEY_ID)
2. Backend → Razorpay: Create order (using KEY_SECRET)
3. Backend → Frontend: Return order_id (safe)
4. Frontend → Razorpay Checkout: Open payment form
5. User pays via Razorpay
6. Razorpay → Frontend: Payment response (with signature)
7. Frontend → Backend: Send signature for verification
8. Backend → Razorpay: Verify signature (using KEY_SECRET)
9. Backend → Firebase: Save verified payment
10. Backend → Frontend: Confirm success
```

---

## 🛠️ API ENDPOINTS

### Create Order
```
POST /api/razorpay/create-order

Request:
{
  "amount": 5000,
  "currency": "INR",
  "receipt": "receipt_123456",
  "notes": {
    "buyerId": "user_123",
    "productId": "prod_123"
  }
}

Response:
{
  "success": true,
  "data": {
    "order_id": "order_DBJOWzybf0sJbb",
    "amount": 500000,
    "currency": "INR"
  }
}
```

### Verify Payment ⭐ CRITICAL
```
POST /api/razorpay/verify-payment

Request:
{
  "razorpay_order_id": "order_DBJOWzybf0sJbb",
  "razorpay_payment_id": "pay_XXXXX",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment_id": "pay_XXXXX",
    "order_id": "order_DBJOWzybf0sJbb",
    "amount": 500000,
    "status": "captured"
  }
}
```

### Fetch Payment Details
```
GET /api/razorpay/payment/{paymentId}

Response:
{
  "success": true,
  "data": {
    "id": "pay_XXXXX",
    "amount": 500000,
    "currency": "INR",
    "status": "captured",
    "created_at": 1234567890
  }
}
```

---

## 📝 STEP-BY-STEP TEST FLOW

### Test Scenario: Buy Product

#### Step 1: Environment Check
```bash
# Backend
npm run dev  # Server should start on :5000

# Frontend
npm run dev  # Should start on :5173

# Environment
cat server/.env.local    # Check RAZORPAY keys
cat .env.local          # Check VITE_RAZORPAY_KEY_ID
```

#### Step 2: Create Order
```bash
curl -X POST http://localhost:5000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "receipt": "receipt_test_001",
    "notes": {"test": "true"}
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "order_id": "order_XXXXX",
    "amount": 500000,
    "currency": "INR"
  }
}
```

#### Step 3: Frontend Component Test
```tsx
import { RazorpayPayment } from '@/components/RazorpayPayment';

export function TestPayment() {
  return (
    <RazorpayPayment
      amount={100}
      description="Test Payment"
      onSuccess={(data) => {
        console.log('✅ Success:', data);
        alert(`Payment ID: ${data.paymentId}`);
      }}
      onError={(error) => {
        console.error('❌ Error:', error);
        alert(`Error: ${error.message}`);
      }}
    />
  );
}
```

#### Step 4: Manual Testing
1. Click "Pay ₹100 Now" button
2. Browser opens Razorpay checkout
3. Enter test card: `4111 1111 1111 1111`
4. Enter OTP (shown in checkout)
5. Click "Pay"
6. ✅ Success page appears

#### Step 5: Verify Backend Records
```bash
# Check Firebase Firestore
# Collections > payments > documents with razorpayPaymentId
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: "Failed to load Razorpay script"
```
❌ Error: Failed to load Razorpay script

Fix:
1. Check browser console for CSP errors
2. Add to vite.config.ts:
   server: {
     open: 'http://localhost:5173'
   }
3. Ensure VITE_RAZORPAY_KEY_ID is set in .env.local
```

### Issue 2: "Invalid order ID"
```
❌ Error: Invalid order ID

Fix:
1. Verify backend is running (http://localhost:5000/health)
2. Check RAZORPAY_KEY_ID in server/.env.local
3. Ensure CREATE_ORDER endpoint returns valid order_id
```

### Issue 3: "Payment verification failed"
```
❌ Error: Payment verification failed

Fix:
1. Check RAZORPAY_KEY_SECRET is set in server/.env.local
2. Ensure backend is receiving correct signature from frontend
3. Verify signature algorithm uses SHA-256
4. Check server logs for detailed error
```

### Issue 4: CORS Error
```
❌ Error: Cross-Origin Request Blocked

Fix in server/.env.local:
FRONTEND_URL=http://localhost:5173

Or for production:
FRONTEND_URL=https://yourdomain.com
```

---

## 📊 MONITORING & DEBUGGING

### Enable Debug Logs
```typescript
// On frontend
// All console.log in razorpayService.ts will show:
// ✅ Order created
// 💳 Opening checkout
// ✅ Payment captured
// ✅ Payment verified successfully

// On backend
// Enable detailed logging:
console.log('📦 Creating Razorpay order:', { amount, currency });
console.log('✅ Order created:', order.id);
console.log('✅ Payment signature verified:', razorpay_payment_id);
```

### Check Payment Status in Dashboard
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Click **Payments** in left menu
3. Find your test payment
4. Check status: "Captured" = Success

### View Firestore Records
1. Firebase Console > Your Project > Firestore Database
2. Collections tab > `payments`
3. Find document with `razorpayPaymentId`
4. Verify all fields are correct

---

## 🔄 PRODUCTION DEPLOYMENT

### 1. Get Live Keys
1. In Razorpay Dashboard, switch to **Live Mode**
2. Go to **Settings > API Keys**
3. Copy Live Keys (starts with `rzp_live_`)

### 2. Update Environment

**Backend (server/.env)**
```env
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.production)**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
VITE_PAYMENT_API_URL=https://api.yourdomain.com
```

### 3. Security Checklist
- [ ] SECRETKEY never in frontend or public code
- [ ] CORS configured for production domain only
- [ ] HTTPS enabled for both frontend & backend
- [ ] Signature verification enabled on backend
- [ ] Firebase Firestore security rules set
- [ ] Razorpay webhook configured for server events
- [ ] Automated backups enabled
- [ ] Error logging and monitoring set up

### 4. Test in Production Sandbox
```bash
# Before going live with real money
# Use Razorpay's Live Test Mode
# Can create fake transactions to verify flow
```

---

## 📚 USEFUL LINKS

- [Razorpay Documentation](https://razorpay.com/docs/payments)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments-guide/test-cards)
- [API Reference](https://razorpay.com/docs/api/)
- [Signature Verification](https://razorpay.com/docs/payments/webhooks/)
- [Security Best Practices](https://razorpay.com/docs/payments/secure)

---

## ✅ VERIFICATION CHECKLIST

### Development Setup
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] `server/.env.local` has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- [ ] `.env.local` has VITE_RAZORPAY_KEY_ID
- [ ] `npm packages installed in server/` directory
- [ ] Firebase Firestore configured
- [ ] Browser console shows no CORS errors

### Test Payment Flow
- [ ] Can create order via /api/razorpay/create-order
- [ ] Razorpay checkout opens successfully
- [ ] Can complete payment with test card
- [ ] Payment signature verification succeeds
- [ ] Payment record saved to Firestore
- [ ] Success message appears
- [ ] Can see payment in Razorpay dashboard

### Security
- [ ] RAZORPAY_KEY_SECRET NOT exposed to frontend
- [ ] Signature verification happens on backend
- [ ] Payment records saved to Firestore
- [ ] Error messages don't leak sensitive info
- [ ] All HTTPS in production

---

## 🆘 NEED HELP?

### Debug Logs
```bash
# Backend errors
tail -f server/logs/error.log

# Frontend errors
# Open browser DevTools > Console tab
```

### Test API Directly
```bash
# Create order
curl -X POST http://localhost:5000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Health check
curl http://localhost:5000/health
```

---

**Version**: 1.0  
**Last Updated**: April 2025  
**Maintained by**: Shastika Global Impex Development Team
