import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// API endpoint - matches your backend configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://app-finals.onrender.com';

/**
 * Razorpay Payment Interfaces
 */
export interface RazorpayOrderResponse {
  success: boolean;
  data?: {
    order_id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  message?: string;
  error?: string;
}

export interface RazorpayPaymentVerifyResponse {
  success: boolean;
  message?: string;
  data?: {
    payment_id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: number;
  };
  error?: string;
}

export interface RazorpayPaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface SavedPaymentData {
  buyerId: string;
  buyerEmail: string;
  amount: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paymentMethod: 'razorpay';
  status: 'success' | 'pending' | 'failed';
  createdAt: Timestamp | Date;
}

/**
 * STEP 1: Create Razorpay Order
 * 
 * Called from frontend to get order_id.
 * The actual order creation happens on the backend with API keys.
 * 
 * @param amount Amount in INR (will be converted to paise on backend)
 * @param receipt Optional receipt ID
 * @param notes Optional metadata
 * @returns Order details including order_id
 */
export async function createRazorpayOrder(
  amount: number,
  receipt?: string,
  notes?: Record<string, string>
): Promise<RazorpayOrderResponse> {
  try {
    if (!amount || amount < 1) {
      throw new Error('Invalid amount - must be at least ₹1');
    }

    const response = await fetch(`${API_BASE_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          client_created_at: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: RazorpayOrderResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }

    console.log('✅ Order created:', data.data?.order_id);
    return data;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

/**
 * Load Razorpay Checkout Script
 * Must be called before opening checkout
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Open Razorpay Checkout Modal
 * 
 * This opens the standard Razorpay payment form.
 * User payment details are entered directly in Razorpay's secure form.
 * 
 * @param orderId Razorpay Order ID
 * @param amount Amount in INR
 * @param userEmail User's email
 * @param userName User's name
 * @param onSuccess Callback after payment succeeds
 * @param onError Callback if payment fails
 */
export async function openRazorpayCheckout(
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string,
  onSuccess: (paymentData: RazorpayPaymentData) => void,
  onError: (error: any) => void
): Promise<void> {
  try {
    // Ensure script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    const Razorpay = (window as any).Razorpay;

    // Razorpay Checkout Options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SlwOcx9B6AaXXp", // Only KEY_ID, never KEY_SECRET
      order_id: orderId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Shastika Global Impex',
      description: `Payment for Order ${orderId}`,
      image: '/logo.png', // Optional: Your company logo
      prefill: {
        email: userEmail,
        contact: '', // User can enter phone in checkout
        name: userName,
      },
      theme: {
        color: '#3b82f6', // Your brand color
      },
      // Handler: Called after user completes payment
      handler: (response: RazorpayPaymentData) => {
        console.log('✅ Payment captured:', response.razorpay_payment_id);
        onSuccess(response);
      },
      // Called if there's an error
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpayCheckout = new Razorpay(options);

    // Handle payment errors from Razorpay
    razorpayCheckout.on('payment.failed', (response: any) => {
      console.error('❌ Payment failed:', response.error);
      onError(new Error(response.error.description || 'Payment failed'));
    });

    razorpayCheckout.open();
  } catch (error) {
    console.error('❌ Error opening checkout:', error);
    onError(error);
  }
}

/**
 * STEP 2: Verify Payment Signature on Backend
 * 
 * CRITICAL SECURITY STEP - This MUST be done on backend:
 * - Never verify signature on frontend
 * - Signature verification uses SECRET key (never expose to frontend)
 * - Backend compares HMAC signatures
 * 
 * @param paymentData Payment response from Razorpay
 * @returns Verification result
 */
export async function verifyRazorpayPayment(
  paymentData: RazorpayPaymentData
): Promise<RazorpayPaymentVerifyResponse> {
  try {
    if (!paymentData.razorpay_payment_id || !paymentData.razorpay_order_id || !paymentData.razorpay_signature) {
      throw new Error('Missing payment details');
    }

    const response = await fetch(`${API_BASE_URL}/api/razorpay/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status}`);
    }

    const result: RazorpayPaymentVerifyResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Payment verification failed');
    }

    console.log('✅ Payment verified successfully');
    return result;
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    throw error;
  }
}

/**
 * Save verified payment to Firestore
 * Only called AFTER backend verification is successful
 */
export async function saveRazorpayPayment(
  paymentData: SavedPaymentData
): Promise<string> {
  try {
    const paymentRef = collection(db, 'payments');
    const docRef = await addDoc(paymentRef, {
      ...paymentData,
      createdAt: paymentData.createdAt instanceof Date
        ? Timestamp.fromDate(paymentData.createdAt)
        : paymentData.createdAt,
    });

    console.log('✅ Payment saved to Firestore:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving payment:', error);
    throw new Error('Failed to save payment record');
  }
}

/**
 * Complete Razorpay Payment Flow
 * 
 * This is the main function that orchestrates the entire payment process:
 * 1. Create Razorpay Order
 * 2. Open Razorpay Checkout
 * 3. Verify payment signature on backend
 * 4. Save payment to Firestore
 * 
 * Usage:
 * try {
 *   await processRazorpayPayment({
 *     amount: 5000,
 *     buyerId: 'user123',
 *     buyerEmail: 'user@example.com',
 *     buyerName: 'John Doe',
 *     productId: 'prod123',
 *   });
 * } catch (error) {
 *   console.error('Payment failed:', error);
 * }
 */
export async function processRazorpayPayment(options: {
  amount: number;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  productId?: string;
  customNotes?: Record<string, string>;
}): Promise<{ paymentId: string; orderId: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        amount,
        buyerId,
        buyerEmail,
        buyerName,
        productId,
        customNotes = {},
      } = options;

      console.log('🔄 Starting Razorpay payment process...');

      // Step 1: Create Razorpay Order on backend
      console.log('📦 Creating order...');
      const orderResponse = await createRazorpayOrder(
        amount,
        `receipt_${Date.now()}`,
        {
          buyerId,
          buyerEmail,
          productId: productId || 'general',
          ...customNotes,
        }
      );

      if (!orderResponse.success || !orderResponse.data?.order_id) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderId = orderResponse.data.order_id;

      // Step 2: Open Razorpay Checkout Modal
      console.log('💳 Opening checkout...');
      await openRazorpayCheckout(
        orderId,
        amount,
        buyerEmail,
        buyerName,
        async (paymentData) => {
          try {
            console.log('✅ Payment capture successful, verifying...');

            // Step 3: Verify payment signature on backend
            const verifyResponse = await verifyRazorpayPayment(paymentData);

            if (!verifyResponse.success) {
              throw new Error('Payment verification failed');
            }

            // Step 4: Save payment to Firestore (only after verification)
            const paymentId = await saveRazorpayPayment({
              buyerId,
              buyerEmail,
              amount,
              razorpayPaymentId: paymentData.razorpay_payment_id,
              razorpayOrderId: paymentData.razorpay_order_id,
              paymentMethod: 'razorpay',
              status: 'success',
              createdAt: new Date(),
            });

            console.log('✅ Payment completed successfully');
            resolve({ paymentId, orderId: paymentData.razorpay_order_id });
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('❌ Checkout error:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('❌ Payment process error:', error);
      reject(error);
    }
  });
}
