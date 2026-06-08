import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ClipboardList, DollarSign, MessageCircle, ShoppingBag, CreditCard, Truck, Bot, TrendingUp, Leaf } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`stat-icon ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="premium-card p-4 flex flex-col items-center gap-2 hover:shadow-lg transition group text-center">
    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
  </button>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const { currentUser, products, orders, messages } = useStore();
  const navigate = useNavigate();
  const role = currentUser?.role;
  const myOrders = orders.filter(o => role === 'buyer' ? o.buyerId === currentUser?.id : true);
  const totalRevenue = myOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t('welcome')}, {currentUser?.name} 👋</h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            {role === 'farmer' ? t('totalProducts') : role === 'buyer' ? t('totalOrders') : t('dashboardStats')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {role === 'farmer' && <>
          <StatCard icon={Package} label={t('totalProducts')} value={`${products.filter(p => p.farmerName === currentUser?.name).length}`} color="bg-primary/15 text-primary" />
          <StatCard icon={ClipboardList} label={t('totalOrders')} value={`${orders.filter(o => products.some(p => p.id === o.productId && p.farmerName === currentUser?.name)).length}`} color="bg-secondary/15 text-secondary" />
          <StatCard icon={DollarSign} label={t('totalSales')} value={`₹${(totalRevenue / 100000).toFixed(1)}L`} color="bg-accent/15 text-accent" />
          <StatCard icon={MessageCircle} label={t('notifications')} value={`${messages.length}`} color="bg-info/15 text-info" />
        </>}
        {role === 'buyer' && <>
          <StatCard icon={ShoppingBag} label={t('marketplace')} value={`${products.length}`} color="bg-primary/15 text-primary" />
          <StatCard icon={ClipboardList} label={t('totalOrders')} value={`${myOrders.length}`} color="bg-secondary/15 text-secondary" />
          <StatCard icon={DollarSign} label={t('totalSales')} value={`₹${(totalRevenue / 100000).toFixed(1)}L`} color="bg-accent/15 text-accent" />
          <StatCard icon={Truck} label={t('shipment')} value={`${myOrders.filter(o => o.shipmentStatus !== 'delivered').length}`} color="bg-info/15 text-info" />
        </>}
        {role === 'admin' && <>
          <StatCard icon={Package} label={t('totalProducts')} value={`${products.length}`} color="bg-primary/15 text-primary" />
          <StatCard icon={ClipboardList} label={t('totalOrders')} value={`${orders.length}`} color="bg-secondary/15 text-secondary" />
          <StatCard icon={DollarSign} label={t('totalSales')} value={`₹${(totalRevenue / 100000).toFixed(1)}L`} color="bg-accent/15 text-accent" />
          <StatCard icon={TrendingUp} label={t('onlineUsers')} value="0" color="bg-info/15 text-info" />
        </>}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('dashboard')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {role === 'farmer' && <>
            <QuickAction icon={Leaf} label={t('farming')} onClick={() => navigate('/farmer-dashboard')} />
            <QuickAction icon={ShoppingBag} label={t('marketplace')} onClick={() => navigate('/marketplace')} />
            <QuickAction icon={MessageCircle} label={t('chat')} onClick={() => navigate('/chat')} />
          </>}
          {role === 'buyer' && <>
            <QuickAction icon={ShoppingBag} label={t('marketplace')} onClick={() => navigate('/marketplace')} />
            <QuickAction icon={ClipboardList} label={t('orders')} onClick={() => navigate('/orders')} />
            <QuickAction icon={CreditCard} label={t('payment')} onClick={() => navigate('/payments')} />
            <QuickAction icon={Truck} label={t('shipment')} onClick={() => navigate('/shipment')} />
            <QuickAction icon={MessageCircle} label={t('chat')} onClick={() => navigate('/chat')} />
          </>}
          {role === 'admin' && <>
            <QuickAction icon={ShoppingBag} label={t('marketplace')} onClick={() => navigate('/marketplace')} />
            <QuickAction icon={ClipboardList} label={t('orders')} onClick={() => navigate('/orders')} />
            <QuickAction icon={CreditCard} label={t('payment')} onClick={() => navigate('/payments')} />
            <QuickAction icon={Truck} label={t('shipment')} onClick={() => navigate('/shipment')} />
            <QuickAction icon={MessageCircle} label={t('chat')} onClick={() => navigate('/chat')} />

          </>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
