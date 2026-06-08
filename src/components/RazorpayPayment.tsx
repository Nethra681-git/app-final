import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { processRazorpayPayment } from '@/lib/razorpayService';
import { createOrder } from '@/lib/paymentService';

interface RazorpayPaymentProps {
  amount: number;
  description?: string;
  productId?: string;
  onSuccess?: (data: { paymentId: string; orderId: string }) => void;
  onError?: (error: Error) => void;
}

/**
 * Razorpay Payment Component
 * 
 * Handles complete payment flow:
 * 1. Creates Razorpay order on backend
 * 2. Opens payment checkout
 * 3. Verifies payment signature
 * 4. Saves payment record
 * 
 * Usage:
 * <RazorpayPayment 
 *   amount={5000} 
 *   description="Order #123"
 *   productId="prod_123"
 *   onSuccess={(data) => console.log('Payment successful:', data)}
 *   onError={(error) => console.error('Payment failed:', error)}
 * />
 */
export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  description = 'Payment',
  productId,
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string;
    orderId: string;
  } | null>(null);

  const handlePayment = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      // Get user details (from your auth/context)
      // This is a placeholder - adapt to your auth system
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const userName = localStorage.getItem('userName') || 'User';
      const userId = localStorage.getItem('userId') || 'user_id';

      if (!userEmail || !userId) {
        throw new Error('User not authenticated. Please log in first.');
      }

      console.log('💳 Starting payment for ₹' + amount);

      // Process payment (creates order, opens checkout, verifies, saves)
      const result = await processRazorpayPayment({
        amount,
        buyerId: userId,
        buyerEmail: userEmail,
        buyerName: userName,
        productId,
        customNotes: {
          description,
          timestamp: new Date().toISOString(),
        },
      });

      // Also create order in Firestore
      try {
        await createOrder({
          buyerId: userId,
          buyerEmail: userEmail,
          amount,
          paymentId: result.paymentId,
          orderStatus: 'confirmed',
          createdAt: new Date(),
          productId,
        });
      } catch (orderError) {
        console.warn('⚠️ Failed to create order record:', orderError);
        // Payment was successful, so we proceed even if order record fails
      }

      setPaymentDetails(result);
      setSuccess(true);

      toast({
        title: '✅ Payment Successful!',
        description: `Payment ID: ${result.paymentId}`,
        variant: 'default',
      });

      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);

      toast({
        title: '❌ Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  // Success state
  if (success && paymentDetails) {
    return (
      <div className="space-y-4 p-6 rounded-lg border border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Payment Successful!</h3>
        </div>
        <div className="space-y-2 text-sm text-green-800">
          <p>
            <span className="font-medium">Payment ID:</span> {paymentDetails.paymentId}
          </p>
          <p>
            <span className="font-medium">Order ID:</span> {paymentDetails.orderId}
          </p>
          <p>
            <span className="font-medium">Amount:</span> ₹{amount.toLocaleString()}
          </p>
        </div>
        <Button
          onClick={() => {
            setSuccess(false);
            setPaymentDetails(null);
          }}
          variant="outline"
          className="w-full"
        >
          Make Another Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Razorpay Payment</h3>
      </div>

      {/* Amount Display */}
      <div className="bg-primary/5 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Amount to Pay</p>
        <p className="text-3xl font-bold text-primary">₹{amount.toLocaleString()}</p>
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You will be redirected to a secure payment page after clicking "Pay Now".
        </AlertDescription>
      </Alert>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || amount <= 0}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ₹{amount.toLocaleString()} Now
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>🔒 Secured by Razorpay • PCI DSS Compliant</p>
      </div>
    </div>
  );
};

export default RazorpayPayment;
