import { useStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { Check, X, Package, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { currentUser, products, orders, updateOrderFarmerStatus, updateProductStock, addNotification } = useStore();
  const [stockEditing, setStockEditing] = useState<string | null>(null);
  const [newStock, setNewStock] = useState(0);

  const farmerOrders = orders.filter(o =>
    products.some(p => p.id === o.productId && p.farmerName === currentUser?.name)
  );

  const farmerProducts = products.filter(p => p.farmerName === currentUser?.name);

  const handleAccept = (orderId: string, productName: string, buyerName: string) => {
    updateOrderFarmerStatus(orderId, 'accepted');
    addNotification({
      id: `n${Date.now()}`,
      title: t('farmer_order_accepted'),
      message: `Your order for ${productName} has been accepted by the farmer. It will be processed soon.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['buyer'],
    });
    addNotification({
      id: `n${Date.now() + 1}`,
      title: 'Farmer Accepted Order',
      message: `${currentUser?.name} accepted order for ${productName} from ${buyerName}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin'],
    });
  };

  const handleReject = (orderId: string, productName: string, buyerName: string) => {
    updateOrderFarmerStatus(orderId, 'rejected');
    addNotification({
      id: `n${Date.now()}`,
      title: t('farmer_order_rejected'),
      message: `Your order for ${productName} was rejected by the farmer. Please contact admin for assistance.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['buyer'],
    });
    addNotification({
      id: `n${Date.now() + 1}`,
      title: 'Farmer Rejected Order',
      message: `${currentUser?.name} rejected order for ${productName} from ${buyerName}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin'],
    });
  };

  const handleStockUpdate = (productId: string, productName: string) => {
    updateProductStock(productId, newStock);
    addNotification({
      id: `n${Date.now()}`,
      title: t('farmer_stock_updated'),
      message: `${currentUser?.name} updated stock for ${productName} to ${newStock.toLocaleString()}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin', 'buyer'],
    });
    setStockEditing(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t('farmer_dashboard')}</h1>
      <p className="text-muted-foreground">{t('farmer_description')}</p>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">{t('farmer_my_products')}</h2>
        {farmerProducts.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-muted-foreground">{t('farmer_no_products')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {farmerProducts.map(p => (
              <div key={p.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} • ₹{p.domesticPrice}/{p.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {stockEditing === p.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min={0} 
                          className="w-24 px-2 py-1 border border-input rounded text-sm bg-background text-foreground"
                          value={newStock} 
                          onChange={e => setNewStock(Math.max(0, +e.target.value))} 
                        />
                        <button 
                          onClick={() => handleStockUpdate(p.id, p.name)} 
                          className="px-2 py-1 gradient-primary text-primary-foreground rounded text-xs"
                        >
                          {t('farmer_save_stock')}
                        </button>
                        <button 
                          onClick={() => setStockEditing(null)} 
                          className="px-2 py-1 bg-muted rounded text-xs text-foreground"
                        >
                          {t('farmer_cancel_stock')}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-foreground">{p.quantity.toLocaleString()} {p.unit}</p>
                        <button 
                          onClick={() => { setStockEditing(p.id); setNewStock(p.quantity); }} 
                          className="text-xs text-primary hover:underline"
                        >
                          {t('farmer_update_stock')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">{t('farmer_incoming_orders')}</h2>
        {farmerOrders.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-muted-foreground">{t('farmer_pending_orders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {farmerOrders.map(order => (
              <div key={order.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{order.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('farmer_order_product')} <span className="font-mono text-foreground">{order.id}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('farmer_from_buyer')}: <span className="font-semibold text-foreground">{orders.find(o => o.id === order.id)?.buyerName || 'Unknown'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{t('farmer_quantity')}: {order.quantity}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('farmer_market_type')}: {order.marketType === 'export' ? '🌍 Export' : '🏪 Domestic'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {order.farmerAcceptStatus === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAccept(order.id, order.productName, orders.find(o => o.id === order.id)?.buyerName || 'Unknown')}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded text-sm font-semibold hover:bg-green-200 transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> {t('farmer_accept_order')}
                      </button>
                      <button
                        onClick={() => handleReject(order.id, order.productName, orders.find(o => o.id === order.id)?.buyerName || 'Unknown')}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded text-sm font-semibold hover:bg-red-200 transition flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> {t('farmer_reject_order')}
                      </button>
                    </>
                  ) : (
                    <div className="w-full px-3 py-2 rounded text-sm font-semibold text-center capitalize bg-muted text-foreground">
                      {order.farmerAcceptStatus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
