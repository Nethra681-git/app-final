import { useState } from 'react';
import { useStore } from '@/lib/store';
import { generateInvoice } from '@/lib/invoice';
import { generatePaymentReceipt } from '@/lib/receipt';
import { Download, QrCode, CheckCircle2, Clock, XCircle, ChevronLeft, CreditCard, TrendingUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UPI_ID = '9789090920@okbizaxis';
const COMPANY_NAME = 'Shastika Global Impex Pvt Ltd';

const Payments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, orders, payments, addPayment, addNotification, markOrderPaymentComplete } = useStore();
  const isAdmin = currentUser?.role === 'admin';
  const myOrders = isAdmin ? orders : orders.filter(o => o.buyerId === currentUser?.id);
  const myPayments = isAdmin ? payments : payments.filter(p => p.buyerId === currentUser?.id);

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [txnId, setTxnId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedOrderData = orders.find(o => o.id === selectedOrder);

  // Calculate statistics
  const stats = !isAdmin ? {
    totalPending: myOrders.filter(o => !o.paymentCompleted).length,
    totalPaid: payments.filter(p => p.buyerId === currentUser?.id && p.status !== 'rejected').length,
    totalAmount: myPayments.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: myOrders.filter(o => !o.paymentCompleted).reduce((sum, o) => sum + o.total, 0),
  } : {
    totalReceived: payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'pending').length,
    totalApproved: payments.filter(p => p.status === 'approved').length,
    totalRejected: payments.filter(p => p.status === 'rejected').length,
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="premium-card p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
      <div className={`${color} p-4 rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );

  const upiLink = selectedOrderData
    ? `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${selectedOrderData.total}&cu=INR&tn=${encodeURIComponent(`Order ${selectedOrderData.id}`)}`
    : '';

  const handleSubmitPayment = () => {
    if (!selectedOrderData || !txnId.trim() || !currentUser) return;
    const payment = {
      id: `PAY-${Date.now()}`,
      orderId: selectedOrderData.id,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: currentUser.phone,
      amount: selectedOrderData.total,
      method: 'upi' as const,
      transactionId: txnId.trim(),
      utrNumber: txnId.trim(),
      bankName: 'UPI',
      status: 'pending' as const,
      timestamp: new Date().toLocaleString(),
      adminNote: '',
    };
    addPayment(payment);
    markOrderPaymentComplete(selectedOrderData.id);
    addNotification({
      id: `n${Date.now()}`,
      title: 'Payment Received',
      message: `${currentUser.name} paid ₹${selectedOrderData.total.toLocaleString()} via UPI for order ${selectedOrderData.id}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin'],
    });
    setSubmitted(true);
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  // Buyer: UPI payment view
  if (!isAdmin && selectedOrder && !submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-base text-muted-foreground hover:text-primary transition">
          <ChevronLeft className="w-5 h-5" /> {t('button_back')}
        </button>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('page_order_payment')}</h1>
          <p className="text-muted-foreground">{t('payment_for_order')} {selectedOrderData?.id}</p>
        </div>

        {/* UPI QR Code */}
        <div className="premium-card rounded-2xl p-8 space-y-6 text-center">
          <div className="flex items-center justify-center gap-3 text-primary">
            <QrCode className="w-6 h-6" />
            <span className="font-semibold text-xl">{t('payment_scan_upi')}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 inline-block mx-auto border-2 border-border shadow-lg">
            <QRCodeSVG value={upiLink} size={240} level="H" includeMargin />
          </div>
          <p className="text-base text-muted-foreground">{t('payment_upi_id')}: <span className="font-mono font-bold text-foreground">{UPI_ID}</span></p>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <p className="text-base text-muted-foreground mb-2">{t('amount_to_pay')}</p>
            <p className="text-4xl font-bold text-primary">₹{selectedOrderData?.total.toLocaleString()}</p>
          </div>
          <div className="bg-background border border-border rounded-2xl p-6 text-left space-y-3">
            <p className="text-base font-bold text-foreground">📱 {t('payment_instructions')}:</p>
            <ol className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>1. {t('payment_instruction_1')}</li>
              <li>2. {t('payment_instruction_2')}</li>
              <li>3. {t('payment_instruction_3')} ₹{selectedOrderData?.total.toLocaleString()}</li>
              <li>4. {t('payment_instruction_4')}</li>
            </ol>
          </div>
        </div>

        {/* Confirm payment */}
        <div className="premium-card rounded-2xl p-8 space-y-6">
          <h3 className="font-bold text-xl text-foreground">{t('payment_confirm')}</h3>
          <div>
            <label className="text-base font-semibold text-foreground mb-2 block">{t('payment_txn_label')} *</label>
            <input 
              className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-foreground outline-none focus:border-primary"
              placeholder={t('payment_txn_placeholder')}
              value={txnId} 
              onChange={e => setTxnId(e.target.value)} 
            />
          </div>
          <button 
            onClick={handleSubmitPayment} 
            disabled={!txnId.trim()}
            className={`w-full py-3 rounded-xl font-bold transition text-lg ${txnId.trim() ? 'gradient-primary text-primary-foreground hover:shadow-lg' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          >
            {t('payment_confirm_button')}
          </button>
        </div>
      </div>
    );
  }

  // Buyer: payment confirmed
  if (!isAdmin && submitted) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 animate-fade-in py-8">
        <div className="w-24 h-24 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('payment_submitted')}</h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">{t('payment_submitted_desc')}</p>
        </div>
        <button 
          onClick={() => { setSubmitted(false); setSelectedOrder(null); setTxnId(''); }}
          className="btn-primary px-8 py-3 font-semibold text-lg mx-auto"
        >
          {t('button_back_payments')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-base text-muted-foreground hover:text-primary transition"
      >
        <ChevronLeft className="w-5 h-5" /> {t('button_back_dashboard')}
      </button>
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">{isAdmin ? t('payment_management') : t('payments')}</h1>
        <p className="text-muted-foreground">{t('payments_description')}</p>
      </div>

      {/* Summary stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CreditCard}
            label={t('total_received')}
            value={`₹${(stats.totalReceived / 100000).toFixed(1)}L`}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={Clock}
            label={t('pending')}
            value={stats.totalPending}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatCard
            icon={CheckCircle2}
            label={t('approved')}
            value={stats.totalApproved}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={XCircle}
            label={t('rejected')}
            value={stats.totalRejected}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
        </div>
      )}

      {!isAdmin && (myOrders.length > 0 || myPayments.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            label={t('pending_payments')}
            value={stats.totalPending}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatCard
            icon={CheckCircle2}
            label={t('paid_orders')}
            value={stats.totalPaid}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={CreditCard}
            label={t('total_spent')}
            value={`₹${(stats.totalAmount / 100000).toFixed(1)}L`}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label={t('due_amount')}
            value={`₹${(stats.pendingAmount / 1000).toFixed(0)}K`}
            color="bg-gradient-to-br from-primary to-primary/70"
          />
        </div>
      )}

      {/* Pending orders for buyer to pay */}
      {!isAdmin && myOrders.filter(o => !o.paymentCompleted).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">💳 {t('payment_pay_for_orders')}</h2>
          {myOrders.filter(o => !o.paymentCompleted).map(o => (
            <div key={o.id} className="premium-card p-6 rounded-2xl flex items-center justify-between gap-4 hover:shadow-lg transition-all duration-300">
              <div className="flex-1">
                <p className="text-xl font-bold text-foreground">{o.productName}</p>
                <p className="text-sm text-muted-foreground">{o.id} • {o.orderDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-primary">₹{o.total.toLocaleString()}</p>
                <button 
                  onClick={() => setSelectedOrder(o.id)} 
                  className="btn-primary px-6 py-3 font-semibold text-base whitespace-nowrap"
                >
                  {t('payment_pay_upi')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction history */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">📊 {t('payment_transaction_history')}</h2>
        {myPayments.length === 0 ? (
          <div className="premium-card rounded-2xl p-12 text-center">
            <p className="text-lg text-muted-foreground">{t('no_transactions')}</p>
          </div>
        ) : (
          <div className="premium-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-muted-foreground font-semibold">{t('payment_transaction')}</th>
                    {isAdmin && <th className="text-left p-4 text-muted-foreground font-semibold">{t('buyer')}</th>}
                    <th className="text-left p-4 text-muted-foreground font-semibold">{t('status')}</th>
                    <th className="text-right p-4 text-muted-foreground font-semibold">{t('amount')}</th>
                    <th className="p-4 text-muted-foreground font-semibold">{t('payment_date')}</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myPayments.map(p => (
                    <tr key={p.id} className="hover:bg-background/50 transition">
                      <td className="p-4 font-mono text-xs font-semibold text-foreground">{p.transactionId}</td>
                      {isAdmin && <td className="p-4 text-foreground"><p className="font-medium">{p.buyerName}</p><p className="text-xs text-muted-foreground">{p.buyerPhone}</p></td>}
                      <td className="p-4"><span className="flex items-center gap-2 text-sm font-semibold">{statusIcon(p.status)} <span className="capitalize">{p.status}</span></span></td>
                      <td className="p-4 text-right font-bold text-foreground text-base">₹{p.amount.toLocaleString()}</td>
                      <td className="p-4 text-sm text-muted-foreground">{p.timestamp}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => generatePaymentReceipt(p)} 
                          className="text-primary hover:text-secondary transition font-semibold" 
                          title={t('button_download_receipt')}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order invoices for buyer */}
      {!isAdmin && myOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">📆 {t('payment_order_invoices')}</h2>
          {myOrders.map(o => (
            <div key={o.id} className="premium-card rounded-2xl p-6 flex items-center justify-between gap-4 hover:shadow-lg transition-all duration-300">
              <div>
                <p className="text-xl font-bold text-foreground">{o.productName}</p>
                <p className="text-sm text-muted-foreground">{o.id} • {o.orderDate}</p>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-3xl font-bold text-primary">₹{o.total.toLocaleString()}</p>
                <button 
                  onClick={() => generateInvoice(o)} 
                  className="btn-secondary px-4 py-2 text-base flex items-center gap-2 whitespace-nowrap"
                >
                  <Download className="w-5 h-5" /> {t('button_download_invoice')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
