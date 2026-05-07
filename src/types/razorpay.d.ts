/**
 * Razorpay TypeScript Type Definitions
 * Extends window interface to support Razorpay checkout
 */

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayCheckoutOptions): RazorpayCheckoutInstance;
    };
  }
}

/**
 * Razorpay Checkout Configuration Options
 */
export interface RazorpayCheckoutOptions {
  key: string; // KEY_ID only (never KEY_SECRET)
  order_id: string; // From backend /create-order endpoint
  amount: number; // Amount in paise (multiply by 100)
  currency: string; // e.g., "INR"
  name: string; // Company/App name
  description: string; // Payment description
  image?: string; // Logo URL
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

/**
 * Razorpay Payment Response
 * Returned after user completes payment
 */
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Razorpay Checkout Instance
 */
export interface RazorpayCheckoutInstance {
  open(): void;
  close(): void;
  on(event: string, handler: (error: any) => void): void;
}

export {};
