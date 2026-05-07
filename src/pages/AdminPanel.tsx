import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useStore, type ShipmentStatus, type PaymentStatus } from '@/lib/store';
import { generatePaymentReceipt } from '@/lib/receipt';
import {
  Users, Package, ClipboardList, Truck, DollarSign, Bell, TrendingUp,
  Check, X, Ban, Download, Shield, Edit2, Save, AlertCircle, MessageCircle,
  ChevronRight
} from 'lucide-react';

const tabs = ['Users', 'Products', 'Orders', 'Payments', 'Shipments', 'Pricing', 'Notifications', 'Revenue'];

// ✅ All 6 shipment steps in order
const SHIPMENT_STEPS: { status: ShipmentStatus; label: string; emoji: string }[] = [
  { status: 'placed',           label: 'Order Placed',     emoji: '📦' },
  { status: 'processing',       label: 'Processing',       emoji: '⚙️' },
  { status: 'shipped',          label: 'Shipped',          emoji: '🚢' },
  { status: 'transit',          label: 'In Transit',       emoji: '🗺️' },
  { status: 'out_for_delivery', label: 'Out for Delivery', emoji: '🏠' },
  { status: 'delivered',        label: 'Delivered',        emoji: '✅' },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const {
    users, products, orders, payments, notifications, messages,
    updateUserStatus, updateShipmentStatus, updateProductPrice,
    updatePaymentStatus, addNotification, updateTrackingInfo
  } = useStore();
  const [activeTab, setActiveTab] = useState('Users');
  const [editPrice, setEditPrice] = useState<{ id: string; domestic: number; export: number } | null>(null);
  const [editTracking, setEditTracking] = useState<{ id: string; trackingNumber: string; trackingLink: string } | null>(null);
  const [txnPin, setTxnPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // ✅ NEW: Track which order's status is being updated (loading state)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // ✅ NEW: Firestore orders for shipment tab (real-time)
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([]);

  const ADMIN_PIN = '1234';

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const authUser = auth.currentUser;
        if (!authUser) {
          setIsAccessDenied(true);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), where('email', '==', authUser.email))
        );
        if (usersSnapshot.empty) { setIsAccessDenied(true); return; }
        const userData = usersSnapshot.docs[0].data();
        setCurrentUserRole(userData.role);
        if (userData.role !== 'admin') {
          setIsAccessDenied(true);
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAccessDenied(true);
      }
    };
    checkAdminAccess();
  }, [navigate]);

  // Real-time users listener
  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setFirestoreUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingUsers(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setLoadingUsers(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ✅ NEW: Real-time orders listener for Shipments tab
  // firestoreDocId = actual Firestore document ID (used for updateDoc)
  // id = the app-level order ID like ORD-xxx (used for display only)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setFirestoreOrders(snapshot.docs.map(docSnap => ({
          firestoreDocId: docSnap.id,   // ← real Firestore doc ID for updateDoc
          ...docSnap.data(),
          id: docSnap.data().id || docSnap.id, // ← display ID (ORD-xxx or fallback)
        })));
      },
      (error) => console.error('Orders listener error:', error)
    );
    return () => unsubscribe();
  }, []);

  // User status handlers
  const handleApprove = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'approved' });
    } catch (err) {
      setErrorMessage(`Error approving user: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };
  const handleReject = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'rejected' });
    } catch (err) {
      setErrorMessage(`Error rejecting user: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };
  const handleDisable = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'disabled' });
    } catch (err) {
      setErrorMessage(`Error disabling user: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // ✅ Update shipment status - uses firestoreDocId (real Firestore doc ID)
  const handleShipmentStatusUpdate = async (firestoreDocId: string, displayId: string, newStatus: ShipmentStatus) => {
    setUpdatingOrderId(firestoreDocId);
    try {
      await updateDoc(doc(db, 'orders', firestoreDocId), {
        shipmentStatus: newStatus,
        shipmentUpdatedAt: new Date().toISOString(),
      });
      updateShipmentStatus(displayId, newStatus);
    } catch (err) {
      console.error('Error updating shipment status:', err);
      alert('Failed to update status. Try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePriceUpdate = () => {
    if (!editPrice) return;
    updateProductPrice(editPrice.id, editPrice.domestic, editPrice.export);
    const p = products.find(pr => pr.id === editPrice.id);
    addNotification({
      id: `n${Date.now()}`,
      title: 'Price Updated',
      message: `${p?.name} - Domestic: ₹${editPrice.domestic}, Export: ₹${editPrice.export}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['buyer']
    });
    setEditPrice(null);
  };

  const shipmentStatuses: ShipmentStatus[] = ['placed', 'processing', 'shipped', 'transit', 'out_for_delivery', 'delivered'];

  if (isAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card rounded-xl p-8 text-center max-w-sm">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Only admin users can access this panel. Redirecting...</p>
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div className="bg-primary h-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t
                ? 'gradient-primary text-primary-foreground'
                : 'bg-card border border-input text-foreground hover:bg-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── USERS TAB ─── */}
      {activeTab === 'Users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">User Management ({firestoreUsers.length})</h2>
            <p className="text-xs text-muted-foreground">Live updates enabled</p>
          </div>
          {errorMessage && (
            <div className="glass-card rounded-xl p-4 border border-destructive/30 bg-destructive/5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}
          {loadingUsers && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-xl p-4 flex items-center justify-between animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted"></div>
                    <div className="w-8 h-8 rounded-lg bg-muted"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loadingUsers && firestoreUsers.length === 0 && (
            <div className="glass-card rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No registered users yet</p>
            </div>
          )}
          {!loadingUsers && firestoreUsers.map(u => (
            <div key={u.id} className="glass-card rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{u.name || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground">{u.email} • {u.phone} • {u.country}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">
                  Role: <span className="font-medium">{u.role}</span> •
                  Status: <span className={u.status === 'approved' ? 'text-success font-medium' : u.status === 'pending' ? 'text-warning font-medium' : 'text-destructive font-medium'}>{u.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(u.id)} className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition" title="Approve"><Check className="w-4 h-4" /></button>
                <button onClick={() => handleReject(u.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition" title="Reject"><X className="w-4 h-4" /></button>
                <button onClick={() => handleDisable(u.id)} className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition" title="Disable"><Ban className="w-4 h-4" /></button>
                <button onClick={() => navigate(`/chat?userId=${u.id}`)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition" title="Message"><MessageCircle className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── PRODUCTS TAB ─── */}
      {activeTab === 'Products' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">🛍️ Product Management & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold text-primary">{products.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg Domestic Price</p>
              <p className="text-3xl font-bold text-primary">₹{products.length > 0 ? Math.round(products.reduce((s, p) => s + p.domesticPrice, 0) / products.length) : 0}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg Export Price</p>
              <p className="text-3xl font-bold text-primary">₹{products.length > 0 ? Math.round(products.reduce((s, p) => s + p.exportPrice, 0) / products.length) : 0}</p>
            </div>
          </div>
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No products available</p>
            ) : products.map(p => (
              <div key={p.id} className={`glass-card rounded-xl p-4 transition-all ${editPrice?.id === p.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <p className="font-semibold text-foreground text-lg">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} • {p.quantity.toLocaleString()} {p.unit}</p>
                    </div>
                  </div>
                  {editPrice?.id === p.id ? (
                    <button onClick={() => setEditPrice(null)} className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition"><X className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => setEditPrice({ id: p.id, domestic: p.domesticPrice, export: p.exportPrice })} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"><Edit2 className="w-4 h-4" /></button>
                  )}
                </div>
                {editPrice?.id === p.id ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Domestic Price</label>
                        <input type="number" value={editPrice.domestic} onChange={e => setEditPrice({ ...editPrice, domestic: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Export Price</label>
                        <input type="number" value={editPrice.export} onChange={e => setEditPrice({ ...editPrice, export: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handlePriceUpdate} disabled={editPrice.domestic <= 0 || editPrice.export <= 0} className="flex-1 px-4 py-2 bg-success/10 text-success hover:bg-success/20 disabled:opacity-50 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"><Check className="w-4 h-4" /> Save</button>
                      <button onClick={() => setEditPrice(null)} className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Domestic</p><p className="text-2xl font-bold text-primary">₹{p.domesticPrice.toLocaleString()}</p></div>
                    <div className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Export</p><p className="text-2xl font-bold text-primary">₹{p.exportPrice.toLocaleString()}</p></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── PAYMENTS TAB ─── */}
      {activeTab === 'Payments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Payment Verification</h2>
          {!pinVerified ? (
            <div className="glass-card rounded-xl p-6 max-w-sm mx-auto text-center space-y-4">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <p className="font-semibold text-foreground">Enter Transaction PIN</p>
              <input type="password" maxLength={4} className="w-32 mx-auto px-4 py-2 border border-input rounded-lg bg-background text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-primary/30" value={txnPin} onChange={e => setTxnPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" />
              <button onClick={() => { if (txnPin === ADMIN_PIN) setPinVerified(true); else alert('Invalid PIN'); }} className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition block mx-auto">Verify</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="glass-card rounded-xl p-4 text-center"><p className="text-sm text-muted-foreground">Total Received</p><p className="text-2xl font-bold text-primary">₹{payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p></div>
                <div className="glass-card rounded-xl p-4 text-center"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-warning">{payments.filter(p => p.status === 'pending').length}</p></div>
                <div className="glass-card rounded-xl p-4 text-center"><p className="text-sm text-muted-foreground">Total TXN</p><p className="text-2xl font-bold text-secondary">{payments.length}</p></div>
              </div>
              {payments.length === 0 && <p className="text-muted-foreground">No payments yet</p>}
              {payments.map(p => (
                <div key={p.id} className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{p.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{p.buyerEmail} • TXN: {p.transactionId} • UTR: {p.utrNumber}</p>
                      <p className="text-xs text-muted-foreground">{p.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{p.amount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'approved' ? 'bg-success/10 text-success' : p.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{p.status.toUpperCase()}</span>
                    </div>
                  </div>
                  {p.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <button onClick={() => { updatePaymentStatus(p.id, 'approved', 'Verified by admin'); addNotification({ id: `n${Date.now()}`, title: 'Payment Approved ✅', message: `Your payment of ₹${p.amount.toLocaleString()} has been approved.`, timestamp: new Date().toLocaleString(), read: false, targetRoles: ['buyer'] }); }} className="px-4 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition text-sm font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Approve</button>
                      <button onClick={() => { updatePaymentStatus(p.id, 'rejected', 'Rejected by admin'); addNotification({ id: `n${Date.now()}`, title: 'Payment Rejected ❌', message: `Your payment of ₹${p.amount.toLocaleString()} was rejected.`, timestamp: new Date().toLocaleString(), read: false, targetRoles: ['buyer'] }); }} className="px-4 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition text-sm font-medium flex items-center gap-1"><X className="w-3 h-3" /> Reject</button>
                      <button onClick={() => generatePaymentReceipt(p)} className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium flex items-center gap-1"><Download className="w-3 h-3" /> Receipt</button>
                    </div>
                  )}
                  {p.status !== 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <button onClick={() => generatePaymentReceipt(p)} className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium flex items-center gap-1"><Download className="w-3 h-3" /> Receipt</button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ─── ORDERS TAB ─── */}
      {activeTab === 'Orders' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">All Orders ({orders.length})</h2>
          {orders.map(o => (
            <div key={o.id} className="glass-card rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-foreground">{o.productName}</p>
                  <p className="text-sm text-muted-foreground">{o.id} • {o.buyerName} • {o.orderDate}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.paymentCompleted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{o.paymentCompleted ? '💰 Paid' : '⏳ Payment Pending'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.farmerAcceptStatus === 'accepted' ? 'bg-success/10 text-success' : o.farmerAcceptStatus === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>Farmer: {o.farmerAcceptStatus}</span>
                  </div>
                </div>
                <p className="font-bold text-primary">₹{o.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No orders</p>}
        </div>
      )}

      {/* ─── SHIPMENTS TAB ─── */}
      {activeTab === 'Shipments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Shipment Control
            <span className="ml-2 text-sm font-normal text-muted-foreground">({firestoreOrders.length} orders)</span>
          </h2>

          {firestoreOrders.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No orders found in database</p>
          )}

          {firestoreOrders.map(o => {
            const currentStepIdx = SHIPMENT_STEPS.findIndex(s => s.status === o.shipmentStatus);
            const isUpdating = updatingOrderId === o.firestoreDocId;

            return (
              <div key={o.id} className="glass-card rounded-xl p-5 space-y-5">

                {/* Order Info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{o.productName}</p>
                    <p className="text-sm text-muted-foreground">{o.id} • {o.buyerName || o.buyerEmail}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {o.shipmentStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {isUpdating && (
                    <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
                  )}
                </div>

                {/* ✅ Step-by-step status buttons */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Update Shipment Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SHIPMENT_STEPS.map((step, idx) => {
                      const isDone = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const isNext = idx === currentStepIdx + 1;

                      return (
                        <button
                          key={step.status}
                          disabled={isUpdating || isCurrent}
                          onClick={() => handleShipmentStatusUpdate(o.firestoreDocId, o.id, step.status)}
                          className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                            ${isCurrent
                              ? 'bg-primary text-primary-foreground border-primary cursor-default shadow-md'
                              : isDone
                              ? 'bg-success/10 text-success border-success/30 hover:bg-success/20'
                              : isNext
                              ? 'bg-warning/10 text-warning border-warning/40 hover:bg-warning/20 ring-1 ring-warning/30'
                              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            }
                            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title={
                            isCurrent ? 'Current status' :
                            isDone ? 'Already completed — click to revert' :
                            isNext ? 'Next step — click to advance' :
                            'Click to jump to this status'
                          }
                        >
                          <span>{step.emoji}</span>
                          <span>{step.label}</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 ml-0.5" />}
                          {isNext && <ChevronRight className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Visual progress bar */}
                  <div className="mt-4 flex gap-1">
                    {SHIPMENT_STEPS.map((step, idx) => (
                      <div
                        key={step.status}
                        className={`flex-1 h-1.5 rounded-full transition-all ${
                          idx <= currentStepIdx ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Placed</span>
                    <span className="text-xs text-muted-foreground">Delivered</span>
                  </div>
                </div>

                {/* Tracking info */}
                <div className="border-t border-border pt-3 flex justify-end">
                  {editTracking?.id === o.id ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                      <input type="text" placeholder="Tracking Number" className="flex-1 w-full px-3 py-1.5 text-sm border border-input bg-background rounded-lg" value={editTracking.trackingNumber} onChange={e => setEditTracking({ ...editTracking, trackingNumber: e.target.value })} />
                      <input type="text" placeholder="Tracking Link (Optional)" className="flex-1 w-full px-3 py-1.5 text-sm border border-input bg-background rounded-lg" value={editTracking.trackingLink} onChange={e => setEditTracking({ ...editTracking, trackingLink: e.target.value })} />
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => { updateTrackingInfo(o.id, editTracking.trackingNumber, editTracking.trackingLink); setEditTracking(null); }} className="px-4 py-1.5 flex-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Save</button>
                        <button onClick={() => setEditTracking(null)} className="px-4 py-1.5 flex-1 bg-muted text-foreground rounded-lg text-sm font-medium">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditTracking({ id: o.id, trackingNumber: o.trackingNumber || '', trackingLink: o.trackingLink || '' })}
                      className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Tracking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── PRICING TAB ─── */}
      {activeTab === 'Pricing' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Price Management</h2>
          {products.map(p => (
            <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-white/10" />
                <div><p className="font-semibold text-foreground">{p.name}</p><p className="text-sm text-muted-foreground">D: ₹{p.domesticPrice}/{p.unit} | E: ₹{p.exportPrice}/{p.unit}</p></div>
              </div>
              {editPrice?.id === p.id ? (
                <div className="flex items-center gap-2">
                  <input type="number" className="w-20 px-2 py-1 border border-input rounded text-sm bg-background text-foreground" value={editPrice.domestic} onChange={e => setEditPrice({ ...editPrice, domestic: +e.target.value })} />
                  <input type="number" className="w-20 px-2 py-1 border border-input rounded text-sm bg-background text-foreground" value={editPrice.export} onChange={e => setEditPrice({ ...editPrice, export: +e.target.value })} />
                  <button onClick={handlePriceUpdate} className="px-3 py-1 gradient-primary text-primary-foreground rounded text-sm">Save</button>
                  <button onClick={() => setEditPrice(null)} className="px-3 py-1 bg-muted rounded text-sm text-foreground">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditPrice({ id: p.id, domestic: p.domesticPrice, export: p.exportPrice })} className="px-3 py-1.5 border border-primary text-primary rounded-lg text-sm hover:bg-primary/10 transition">Edit Price</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── NOTIFICATIONS TAB ─── */}
      {activeTab === 'Notifications' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          {notifications.length === 0 && <p className="text-muted-foreground">No notifications</p>}
          {notifications.map(n => (
            <div key={n.id} className="glass-card rounded-xl p-4">
              <p className="font-semibold text-foreground">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground">{n.timestamp} • Target: {n.targetRoles.join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── REVENUE TAB ─── */}
      {activeTab === 'Revenue' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Revenue Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-5 text-center"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-3xl font-bold text-primary">₹{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}</p></div>
            <div className="glass-card rounded-xl p-5 text-center"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-3xl font-bold text-secondary">{orders.length}</p></div>
            <div className="glass-card rounded-xl p-5 text-center"><p className="text-sm text-muted-foreground">Avg Order Value</p><p className="text-3xl font-bold text-accent">₹{orders.length ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length).toLocaleString() : 0}</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;