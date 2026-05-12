import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import { generateInvoice } from '@/lib/invoice';
import { ChevronLeft, Download, Truck, QrCode, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = '9789090920@okbizaxis';
const COMPANY_NAME = 'Shastika Global Impex Pvt Ltd';

// ✅ FIX: localhost:3001 பதிலா Render URL use பண்றோம்
const API_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || 'https://app-finals.onrender.com';

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, currentUser, addOrder, addNotification, markOrderPaymentComplete, addPayment } = useStore();
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [marketType, setMarketType] = useState<'domestic' | 'international'>('domestic');
  const [shippingMethod, setShippingMethod] = useState<'sea' | 'air'>('sea');
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [orderId, setOrderId] = useState('');

  if (!product || !currentUser) return <div className="text-center py-20 text-muted-foreground">Not available</div>;

  const price = marketType === 'domestic' ? product.domesticPrice : product.exportPrice;
  const total = price * quantity;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  const handleProceedToPayment = () => {
    const oid = `ORD-${Date.now()}`;
    const firebaseUid = auth.currentUser?.uid || currentUser.id;

    const order = {
      id: oid,
      productId: product.id,
      productName: product.name,
      quantity,
      price,
      total,
      buyerId: firebaseUid,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: currentUser.phone,
      farmerName: product.farmerName,
      paymentMethod: 'upi' as const,
      shipmentStatus: 'placed' as const,
      shippingMethod,
      destinationCountry: currentUser.country,
      orderDate: new Date().toLocaleDateString(),
      marketType,
      farmerAcceptStatus: 'pending' as const,
      paymentCompleted: false,
    };

    addOrder(order);
    setOrderId(oid);

    addNotification({
      id: `n${Date.now()}`,
      title: 'புதிய ஆர்டர் வந்தது! 🛒',
      message: `புதிய ஆர்டர் வந்தது: ${product.name}, ${quantity} ${product.unit}. விவரங்களை பார்க்க அப்பை திறக்கவும்.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['farmer'],
    });

    addNotification({
      id: `n${Date.now() + 1}`,
      title: 'New Order Placed',
      message: `${currentUser.name} placed order for ${product.name} (${quantity} ${product.unit}) — ₹${total.toLocaleString()}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin'],
    });

    setStep('payment');
  };

  const handleRazorpay = async () => {
    try {
      const loadScript = () => new Promise((resolve) => {
        if ((window as any).Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
      });

      const loaded = await loadScript();
      if (!loaded) { alert('Failed to load payment gateway'); return; }

      const res = await fetch(`${API_BASE_URL}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      });

      const data = await res.json();
      if (!data.success) { alert("Error creating order"); return; }

      const firebaseUid = auth.currentUser?.uid || currentUser.id;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SlwOcx9B6AaXXp",
        amount: data.data.amount,
        currency: "INR",
        order_id: data.data.order_id,
        handler: function (response: any) {
          markOrderPaymentComplete(orderId);
          addPayment({
            id: `PAY-${Date.now()}`,
            orderId,
            buyerId: firebaseUid,
            buyerName: currentUser.name,
            buyerEmail: currentUser.email,
            buyerPhone: currentUser.phone,
            amount: total,
            method: 'razorpay',
            transactionId: response.razorpay_payment_id,
            utrNumber: response.razorpay_payment_id,
            bankName: 'Razorpay',
            status: 'completed',
            timestamp: new Date().toLocaleString(),
            adminNote: '',
          });
          setStep('confirmed');
        },
        prefill: { name: currentUser.name, email: currentUser.email, contact: currentUser.phone }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Payment error. Please try again.");
    }
  };

  // Step 3: Confirmed
  if (step === 'confirmed') {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6 animate-fade-in mb-20">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Order Confirmed! ✅</h1>
        <p className="text-muted-foreground">Order ID: <span className="font-mono text-primary">{orderId}</span></p>
        <p className="text-sm text-muted-foreground">Your payment is being verified. The farmer will be notified to accept your order.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => { const order = useStore.getState().orders.find(o => o.id === orderId); if (order) generateInvoice(order); }}
            className="flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
            <Download className="w-4 h-4" /> Download Invoice
          </button>
          <button onClick={() => navigate('/shipment')} className="flex items-center gap-2 border border-input px-6 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition">
            <Truck className="w-4 h-4" /> Track Shipment
          </button>
        </div>
        <button onClick={() => navigate('/marketplace')} className="text-sm text-primary hover:underline">Continue Shopping</button>
      </div>
    );
  }

  // Step 2: Payment
  if (step === 'payment') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in mb-20">
        <button onClick={() => setStep('details')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Pay via UPI</h1>

        <div className="glass-card rounded-xl p-6 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <QrCode className="w-5 h-5" />
            <span className="font-semibold text-lg">Scan & Pay</span>
          </div>
          <div className="bg-white rounded-xl p-4 inline-block mx-auto border border-border">
            <QRCodeSVG value={upiLink} size={200} level="H" includeMargin />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">UPI ID:</p>
            <p className="font-mono font-bold text-lg text-foreground">{UPI_ID}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">₹{total.toLocaleString()}</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-left space-y-1">
            <p className="text-sm font-semibold text-foreground">📱 Payment Instructions:</p>
            <p className="text-xs text-muted-foreground">1. Open any UPI app (Google Pay, PhonePe, Paytm)</p>
            <p className="text-xs text-muted-foreground">2. Scan the QR code above OR enter UPI ID manually</p>
            <p className="text-xs text-muted-foreground">3. Enter amount ₹{total.toLocaleString()} and complete payment</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <button onClick={handleRazorpay}
            className="w-full py-3 px-4 rounded-lg font-medium transition bg-[#1f41a0] text-white hover:opacity-90 flex items-center justify-center gap-2">
            💳 Pay with Razorpay
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Order Details
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in mb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-foreground">Place Order</h1>

      <div className="glass-card rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{product.farmerName} • {product.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Quantity ({product.unit})</label>
            <input type="number" min={1}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Market Type</label>
            <select className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none"
              value={marketType} onChange={e => setMarketType(e.target.value as any)}>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Shipping Method</label>
          <div className="flex gap-3 mt-1">
            {(['sea', 'air'] as const).map(m => (
              <button key={m} onClick={() => setShippingMethod(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${shippingMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-input text-foreground hover:bg-muted'}`}>
                {m === 'sea' ? '🚢 Sea Way' : '✈️ Air Way'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <p className="text-sm font-medium text-accent-foreground">📱 Payment Method: <span className="font-bold">UPI + Razorpay</span></p>
          <p className="text-xs text-muted-foreground mt-1">After placing the order, you can pay via UPI QR code or Razorpay.</p>
        </div>

        <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>₹{price}/{product.unit} × {quantity}</p>
          </div>
        </div>

        <button onClick={handleProceedToPayment}
          className="w-full py-3 rounded-lg font-medium transition gradient-primary text-primary-foreground hover:opacity-90">
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
};

export default OrderPage;