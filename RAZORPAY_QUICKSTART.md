# Razorpay Integration - Implementation Checklist

## 🎯 Quick Start Checklist

### Phase 1: Setup (30 minutes)
- [ ] Get Razorpay API Keys from https://dashboard.razorpay.com
- [ ] Create `server/.env.local` with:
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
- [ ] Create `.env.local` in project root with:
  - VITE_RAZORPAY_KEY_ID (test key only)
  - VITE_PAYMENT_API_URL=http://localhost:5000
- [ ] Run `cd server && npm install`
- [ ] Start backend: `npm run dev` in server/
- [ ] Verify backend is running: `curl http://localhost:5000/health`

### Phase 2: Integration (1 hour)
- [ ] Import `RazorpayPayment` component in your page
- [ ] Pass required props: `amount`, `onSuccess`, `onError`
- [ ] Store user email/ID in localStorage (or pass via context)
- [ ] Test with test card: `4111 1111 1111 1111`

### Phase 3: Testing (1 hour)
- [ ] Create test order via API
- [ ] Complete payment with test card
- [ ] Verify Firebase Firestore has payment record
- [ ] Check Razorpay dashboard shows payment
- [ ] Test error scenarios (invalid card, cancelled payment)

### Phase 4: Production (2 hours)
- [ ] Switch Razorpay keys to Live Mode
- [ ] Update backend `.env` with live keys
- [ ] Update frontend `.env.production`
- [ ] Enable HTTPS for both frontend and backend
- [ ] Configure CORS for production domain
- [ ] Test with real payment (test amount first)
- [ ] Monitor Razorpay dashboard

---

## 📁 File Structure

```
shastika-agroconnect-main/
├── server/
│   ├── server.js                 ✅ Express + Razorpay integration
│   ├── package.json              ✅ Dependencies
│   └── .env.example              ✅ Template
│
├── src/
│   ├── lib/
│   │   ├── razorpayService.ts    ✅ Razorpay functions
│   │   ├── paymentService.ts     ✅ Firestore integration
│   │   └── firebase.ts           ✅ Firebase config
│   │
│   ├── components/
│   │   └── RazorpayPayment.tsx   ✅ Payment component
│   │
│   ├── types/
│   │   └── razorpay.d.ts         ✅ TypeScript definitions
│   │
│   └── pages/
│       ├── Payments.tsx          (Optional: update UI)
│       ├── Orders.tsx            (Optional: add payment button)
│       └── OrderPage.tsx         (Optional: replace UPI with Razorpay)
│
├── RAZORPAY_INTEGRATION_GUIDE.md ✅ Full documentation
├── .env.example                  ✅ Updated with Razorpay keys
└── package.json                  ✅ Already has razorpay package
```

---

## 🔧 Code Examples

### Example 1: Simple Payment Button
```tsx
import { RazorpayPayment } from '@/components/RazorpayPayment';

export function CheckoutPage() {
  return (
    <div>
      <h1>Complete Your Order</h1>
      <RazorpayPayment
        amount={5000}
        description="Order #12345"
        onSuccess={(data) => {
          console.log('Payment successful!', data);
          navigate('/order-confirmation');
        }}
      />
    </div>
  );
}
```

### Example 2: Custom Implementation
```tsx
import { processRazorpayPayment } from '@/lib/razorpayService';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function CustomPayment() {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await processRazorpayPayment({
        amount: 5000,
        buyerId: 'user_123',
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
      });
      console.log('Success:', result);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return <Button onClick={handlePay} disabled={loading}>Pay Now</Button>;
}
```

### Example 3: Multiple Orders
```tsx
import { RazorpayPayment } from '@/components/RazorpayPayment';

export function OrderList({ orders }) {
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="p-4 border rounded">
          <h3>{order.name}</h3>
          <p>₹{order.amount}</p>
          
          <RazorpayPayment
            amount={order.amount}
            productId={order.id}
            description={`Order: ${order.name}`}
            onSuccess={() => markAsPaid(order.id)}
            onError={() => alert('Payment failed')}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Payment
1. Click "Pay" button
2. Razorpay checkout opens
3. Enter: `4111 1111 1111 1111`
4. Enter expiry: any future date (12/25)
5. Enter CVV: any 3 digits (123)
6. Click "Pay"
7. ✅ See success message
8. Check Firestore for payment record

### Scenario 2: Failed Payment
1. Click "Pay" button
2. Enter card: `4000 0000 0000 0002` (fails validation)
3. Click "Pay"
4. ❌ See error message
5. Try again option should appear

### Scenario 3: Cancelled Payment
1. Click "Pay" button
2. Click "X" to close checkout
3. ❌ See "Payment cancelled" error

---

## 🔐 Security Verification

### Frontend Security ✅
```typescript
// ALLOWED: KEY_ID in frontend
const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
// Example value: rzp_test_XXXXXXXXX
```

### Backend Security ✅
```typescript
// PROTECTED: KEY_SECRET only on backend
const keySecret = process.env.RAZORPAY_KEY_SECRET;
// Never logged, never exposed

// SIGNATURE VERIFICATION: Happens on backend
const validated = verifySignature(signature, keySecret);
```

### Database Security ✅
```
Firestore Collections:
├── payments (all successful payments)
├── orders (order records)
└── Requires Auth: Only owner/admin can read
```

---

## 🚀 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/razorpay/create-order` | Create Razorpay order |
| POST | `/api/razorpay/verify-payment` | ⭐ Verify payment signature |
| GET | `/api/razorpay/payment/:id` | Fetch payment details |
| GET | `/api/razorpay/order/:id` | Fetch order details |
| GET | `/health` | Check server status |

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Or kill the process
kill -9 <PID>

# Try different port
PORT=5001 npm run dev
```

### "Script failed to load"
```
1. Check VITE_RAZORPAY_KEY_ID is set
2. Browser console should NOT show CSP errors
3. Try incognito mode (clears cache)
```

### "Signature verification failed"
```
1. Ensure RAZORPAY_KEY_SECRET is in server/.env.local
2. Check backend receives correct payment ID from frontend
3. Enable debug logs in razorpayService.ts
```

### CORS errors
```
Make sure server/.env has:
FRONTEND_URL=http://localhost:5173
(or your production domain)
```

---

## 📊 Environment Variables Checklist

### Backend (server/.env.local)
```
✅ RAZORPAY_KEY_ID=rzp_test_XXXXX
✅ RAZORPAY_KEY_SECRET=XXXXX (keep secret!)
✅ FRONTEND_URL=http://localhost:5173
✅ PORT=5000
✅ NODE_ENV=development
```

### Frontend (.env.local)
```
✅ VITE_RAZORPAY_KEY_ID=rzp_test_XXXXX
✅ VITE_PAYMENT_API_URL=http://localhost:5000
```

---

## 🎓 Learning Path

1. **Understand Flow** (10 min)
   - Read RAZORPAY_INTEGRATION_GUIDE.md "Architecture" section
   - Understand why signature verification is critical

2. **Set Up Environment** (30 min)
   - Create API keys on Razorpay
   - Configure .env files
   - Start backend and verify

3. **Test Basic Flow** (30 min)
   - Use RazorpayPayment component
   - Complete test payment
   - Verify Firestore record

4. **Customize UI** (1 hour)
   - Modify component styling
   - Add to existing pages
   - Add error handling

5. **Production Ready** (1 hour)
   - Switch to live keys
   - Configure HTTPS
   - Test with production domain
   - Set up monitoring

---

## 📞 Support

### Resources
- **Razorpay Docs**: https://razorpay.com/docs
- **This Guide**: RAZORPAY_INTEGRATION_GUIDE.md
- **Code Reference**: src/lib/razorpayService.ts

### Files to Reference
- Backend: `server/server.js`
- Frontend Service: `src/lib/razorpayService.ts`
- Component: `src/components/RazorpayPayment.tsx`
- Types: `src/types/razorpay.d.ts`

---

✨ **Status**: Ready for Testing  
📅 **Last Updated**: April 2025  
👤 **Maintained By**: Development Team
