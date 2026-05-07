import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle, CheckCircle2, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStore } from '@/lib/store';
import { processPaymentAndCreateOrder, validateTransactionId } from '@/lib/paymentService';

const UPI_ID = '9789090920@okbizaxis';
const COMPANY_NAME = 'Shastika Global Impex Pvt Ltd';

interface PaymentConfirmationProps {
  userId?: string;
  userEmail?: string;
  amount?: number;
  paymentDescription?: string; // e.g., "Order #ORD-123456"
}

/**
 * Payment Confirmation Component
 * 
 * Displays UPI QR code and handles payment confirmation with Firebase integration
 * Creates both payment and order records in Firestore
 * 
 * Can be used as:
 * 1. Route: /payment-confirmation?amount=5000
 * 2. Component with props: <PaymentConfirmation userId="..." userEmail="..." amount={5000} />
 */
const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  userId: propUserId,
  userEmail: propUserEmail,
  amount: propAmount,
  paymentDescription: propPaymentDescription,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useStore();

  // Get values from props first, then search params, then fallback
  const userId = propUserId || currentUser?.id || '';
  const userEmail = propUserEmail || currentUser?.email || '';
  const amountParam = propAmount || (searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : 0);
  const amount = amountParam > 0 ? amountParam : 5000; // Default to 5000 if not provided
  const paymentDescription = propPaymentDescription || `Payment of ₹${amount}`;

  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Generate UPI link for QR code
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentDescription)}`;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if user data exists
    if (!userId || !userEmail) {
      setError('User information is missing. Please log in and try again.');
      return;
    }

    // Validate transaction ID
    const validation = validateTransactionId(transactionId);
    if (!validation.valid) {
      setError(validation.error || 'Invalid transaction ID');
      return;
    }

    setIsLoading(true);

    try {
      // Process payment and create order
      const { paymentId, orderId } = await processPaymentAndCreateOrder(
        userId,
        userEmail,
        amount,
        transactionId
      );

      console.log('✅ Payment successful:', { paymentId, orderId });

      setSuccess(true);
      setSuccessMessage(
        `Payment Successful! Order Confirmed\n\nPayment ID: ${paymentId}\nOrder ID: ${orderId}`
      );
      setTransactionId('');

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      console.error('❌ Payment error:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Success state - show confirmation message
  if (success) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in py-8">
        <div className="glass-card rounded-xl p-8 space-y-4 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-success animate-in zoom-in" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
          <p className="text-muted-foreground">{successMessage}</p>
          <p className="text-sm text-muted-foreground">Redirecting to orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground text-center">Payment Confirmation</h1>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* UPI QR Code Section */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <QrCode className="w-5 h-5" />
          <span className="font-semibold text-lg">Scan & Pay via UPI</span>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg p-4 flex justify-center border border-border">
          <QRCodeSVG 
            value={upiLink} 
            size={220} 
            level="H" 
            includeMargin 
            quietZone={10}
          />
        </div>

        {/* UPI ID */}
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
          <p className="font-mono font-semibold text-foreground text-sm break-all">
            {UPI_ID}
          </p>
        </div>

        {/* Amount to Pay */}
        <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
          <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold text-primary">₹{amount.toLocaleString()}</p>
        </div>

        {/* Instructions */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            📱 Instructions
          </p>
          <ol className="space-y-1 text-xs text-muted-foreground">
            <li>✓ Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
            <li>✓ Scan the QR code above</li>
            <li>✓ Pay ₹{amount.toLocaleString()} to the account</li>
            <li>✓ Copy the Transaction ID / UTR from the payment receipt</li>
          </ol>
        </div>
      </div>

      {/* Payment Confirmation Form */}
      <form onSubmit={handleSubmitPayment} className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Confirm Payment</h2>

        {/* Transaction ID Input */}
        <div className="space-y-2">
          <label htmlFor="txnId" className="text-sm font-medium text-foreground">
            Transaction ID / UTR Number <span className="text-destructive">*</span>
          </label>
          <Input
            id="txnId"
            type="text"
            placeholder="Enter your transaction ID (e.g., 306021345678)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            disabled={isLoading}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            You can find this in your UPI app's payment receipt/confirmation
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !transactionId.trim()}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            'I Have Paid — Confirm Order'
          )}
        </Button>

        {/* Info message */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 text-center">
          ✓ Order will be created immediately after payment confirmation
        </div>
      </form>

      {/* Security Notice */}
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your payment details are secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
