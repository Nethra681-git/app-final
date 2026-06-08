import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { generateInvoice } from '@/lib/invoice';
import { Download, ShoppingCart, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, orders } = useStore();
  const isAdmin = currentUser?.role === 'admin';
  const myOrders = isAdmin ? orders : orders.filter(o => o.buyerId === currentUser?.id);

  // Calculate statistics
  const stats = {
    totalOrders: myOrders.length,
    totalRevenue: myOrders.reduce((sum, o) => sum + o.total, 0),
    completedOrders: myOrders.filter(o => o.shipmentStatus === 'delivered').length,
    pendingOrders: myOrders.filter(o => o.shipmentStatus === 'placed' || o.shipmentStatus === 'processing').length,
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('orders')}</h1>
          <p className="text-muted-foreground">{t('orders_description')}</p>
        </div>
      </div>

      {myOrders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingCart}
            label={t('total_orders')}
            value={stats.totalOrders}
            color="bg-gradient-to-br from-primary to-primary/70"
          />
          <StatCard
            icon={TrendingUp}
            label={t('total_revenue')}
            value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
            color="bg-gradient-to-br from-secondary to-secondary/70"
          />
          <StatCard
            icon={CheckCircle}
            label={t('completed')}
            value={stats.completedOrders}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={Clock}
            label={t('pending')}
            value={stats.pendingOrders}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
        </div>
      )}

      {myOrders.length === 0 ? (
        <div className="premium-card rounded-2xl p-16 text-center">
          <p className="text-lg text-muted-foreground">{t('no_orders_message')}</p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="btn-primary mt-6 px-6 py-3"
          >
            {t('button_browse_marketplace')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(o => (
            <div key={o.id} className="premium-card p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xl font-bold text-foreground">{o.productName}</p>
                    <span className="text-sm px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold">{o.quantity} {t('units')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{o.id} • {o.orderDate}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${o.paymentCompleted ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                      {o.paymentCompleted ? '✅ ' + t('paid') : '⏳ ' + t('pending_payment')}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${o.farmerAcceptStatus === 'accepted' ? 'bg-green-500/20 text-green-700' : o.farmerAcceptStatus === 'rejected' ? 'bg-red-500/20 text-red-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                      👨‍🌾 {t('farmer')}: {o.farmerAcceptStatus}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/20 text-primary capitalize">📦 {o.shipmentStatus.replace('_', ' ')}</span>
                  </div>
                  {o.trackingNumber && (
                    <p className="text-sm text-muted-foreground mt-3">
                      🚚 {t('tracking_id')}: <span className="font-semibold text-foreground">{o.trackingNumber}</span>
                      {o.trackingLink && (
                        <a href={o.trackingLink} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline">
                          {t('view')} →
                        </a>
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary mb-3">₹{o.total.toLocaleString()}</p>
                  <button 
                    onClick={() => generateInvoice(o)} 
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" /> {t('button_download_invoice')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
