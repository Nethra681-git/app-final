/**
 * Razorpay Payment Integration - Setup Instructions
 * 
 * This file contains step-by-step setup for production deployment
 */

// ============================================================================
// STEP 1: INSTALL DEPENDENCIES
// ============================================================================

// Backend dependencies
/* 
cd server
npm install express cors dotenv razorpay
npm install --save-dev nodemon
*/

// Frontend - razorpay already in package.json, just run:
/*
npm install
*/

// ============================================================================
// STEP 2: CONFIGURE ENVIRONMENT
// ============================================================================

// Backend: server/.env
/*
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Get these from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
*/

// Frontend: .env.local
/*
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
VITE_PAYMENT_API_URL=http://localhost:5000
*/

// ============================================================================
// STEP 3: START SERVICES
// ============================================================================

// Terminal 1: Start backend
/*
cd server
npm run dev
# Output: 🚀 Server running on http://localhost:5000
*/

// Terminal 2: Start frontend
/*
npm run dev
# Output: ➜  Local:   http://localhost:5173/
*/

// ============================================================================
// STEP 4: TEST PAYMENT FLOW
// ============================================================================

// Use these test cards:
// Visa: 4111 1111 1111 1111
// Mastercard: 5555 5555 5555 4444
// Amex: 3782 822463 10005

// Any future expiry (e.g., 12/25)
// Any 3-digit CVV (e.g., 123)

// ============================================================================
// STEP 5: INTEGRATE INTO YOUR APP
// ============================================================================

// Option A: Use Pre-built Component
/*
import { RazorpayPayment } from '@/components/RazorpayPayment';

function MyCheckout() {
  return (
    <RazorpayPayment
      amount={5000}
      description="Order #123"
      onSuccess={(data) => {
        console.log('Payment successful:', data);
        // Redirect to confirmation page
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
*/

// Option B: Custom Implementation
/*
import { processRazorpayPayment } from '@/lib/razorpayService';
import { Button } from '@/components/ui/button';

async function handleCheckout() {
  try {
    const result = await processRazorpayPayment({
      amount: 5000,
      buyerId: currentUser.id,
      buyerEmail: currentUser.email,
      buyerName: currentUser.name,
      productId: product.id,
    });
    
    console.log('Payment successful:', result);
    // Redirect with result
    navigate('/success', { state: result });
  } catch (error) {
    console.error('Payment error:', error);
    // Show error to user
  }
}
*/

// ============================================================================
// PRODUCTION DEPLOYMENT
// ============================================================================

// Get Live Keys:
/*
1. Go to https://dashboard.razorpay.com/signin
2. Sign in to your account
3. Navigate to Settings > API Keys
4. Switch to LIVE MODE (red toggle)
5. Copy Key ID and Key Secret
*/

// Update Configuration:
/*
Backend: server/.env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET

Frontend: .env.production
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_ID
*/

// Security Checklist:
/*
✅ KEY_SECRET is NEVER in frontend code
✅ HTTPS enabled for both frontend and backend
✅ Signature verification enabled
✅ Firebase Firestore security rules configured
✅ CORS restricted to production domain only
✅ Environment variables properly secured
✅ Error logging and monitoring configured
✅ Payment records backed up
✅ HTTPS certificates valid and auto-renewing
*/

// ============================================================================
// VERIFICATION
// ============================================================================

// Test Backend Health:
/*
curl http://localhost:5000/health
Expected: {"status":"Server running","timestamp":"..."}
*/

// Test Create Order:
/*
curl -X POST http://localhost:5000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "INR",
    "receipt": "rcpt_001"
  }'

Expected: {
  "success": true,
  "data": {
    "order_id": "order_XXXXX",
    "amount": 500000,
    "currency": "INR"
  }
}
*/

// ============================================================================
// IMPORTANT SECURITY NOTES
// ============================================================================

/*
⚠️ NEVER:
- Expose RAZORPAY_KEY_SECRET in frontend code
- Store SECRET in localStorage or client-side storage
- Commit .env files to git (add to .gitignore)
- Use live keys for development/testing
- Bypass signature verification

✅ ALWAYS:
- Verify payment signature on backend ONLY
- Use test keys for development
- Keep SECRET key on backend only
- Rotate keys regularly
- Delete old keys from Razorpay dashboard
- Monitor failed payments for fraud patterns
- Log all payment attempts for auditing
*/

// ============================================================================
// DEBUGGING
// ============================================================================

// If Razorpay script doesn't load:
/*
1. Check browser DevTools > Console for CSP errors
2. Verify .env file has VITE_RAZORPAY_KEY_ID set correctly
3. Check internet connection
4. Try clearing browser cache and reloading
*/

// If payment verification fails:
/*
1. Check server logs for error messages
2. Verify RAZORPAY_KEY_SECRET in server/.env
3. Check signature format in backend
4. Ensure frontend is sending correct payment response
*/

// If CORS errors:
/*
1. Verify FRONTEND_URL in server/.env matches frontend URL
2. Check that server is sending CORS headers
3. In production, update FRONTEND_URL to production domain
4. Ensure no trailing slashes in FRONTEND_URL
*/

// ============================================================================
// MONITORING IN PRODUCTION
// ============================================================================

/*
1. Set up error logging (e.g., Sentry, LogRocket)
2. Monitor payment failures:
   - Razorpay Dashboard > Payments
   - Filter by status and date
3. Set up alerts for:
   - Failed payments > threshold
   - Backend downtime
   - High error rates
4. Regular backups of Firestore database
5. Monitor Firebase quotas and costs
*/

// ============================================================================
// USEFUL LINKS
// ============================================================================

/*
Razorpay:
- https://dashboard.razorpay.com - Main dashboard
- https://razorpay.com/docs/payments - Documentation
- https://razorpay.com/docs/payments/payments-guide/test-cards - Test cards

Firebase:
- https://console.firebase.google.com - Firebase console
- https://firebase.google.com/docs/firestore - Firestore docs

This Project:
- RAZORPAY_INTEGRATION_GUIDE.md - Full guide
- RAZORPAY_QUICKSTART.md - Quick reference
- src/lib/razorpayService.ts - Frontend service
- server/server.js - Backend implementation
*/

// ============================================================================
// SUPPORT CONTACTS
// ============================================================================

/*
Razorpay Support:
- Email: support@razorpay.com
- Phone: +91 9876543210
- Chat: https://razorpay.com/support

Firebase Support:
- Documentation: https://firebase.google.com/support
- Stack Overflow: Tag with 'firebase'

Your Team:
- [your-contact-info]
*/

export {};
