import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { ChevronLeft, Truck, Package, Globe, MessageCircle } from 'lucide-react';
import { openWhatsAppRandom, openWhatsAppDirect, ADMIN_LABELS } from '@/lib/whatsapp';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, currentUser } = useStore();
  const product = products.find(p => p.id === id);
  const isFarmer = currentUser?.role === 'farmer';
  const isInternational = currentUser?.userType === 'international';

  if (!product) return <div className="text-center py-20 text-muted-foreground">Product not found</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </button>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="h-72 md:h-96 bg-muted overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              width={640}
              height={640}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{product.category}</span>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-3 text-center"><Package className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Packaging</p><p className="text-sm font-medium text-foreground">{product.packaging}</p></div>
              <div className="bg-muted rounded-lg p-3 text-center"><Truck className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Shipping</p><p className="text-sm font-medium text-foreground">{product.shippingType}</p></div>
              <div className="bg-muted rounded-lg p-3 text-center"><Globe className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Export</p><p className="text-sm font-medium text-foreground">{product.exportAvailable ? 'Available' : 'N/A'}</p></div>
              <div className="bg-muted rounded-lg p-3 text-center"><Package className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Quantity</p><p className="text-sm font-medium text-foreground">{product.quantity.toLocaleString()} {product.unit}</p></div>
            </div>
            {!isFarmer && !isInternational && (
              <div className="flex gap-6">
                <div><span className="text-muted-foreground">Domestic:</span> <span className="text-2xl font-bold text-primary">₹{product.domesticPrice}/{product.unit}</span></div>
                <div><span className="text-muted-foreground">Export:</span> <span className="text-2xl font-bold text-secondary">₹{product.exportPrice}/{product.unit}</span></div>
              </div>
            )}
            {isInternational && !isFarmer && <p className="text-lg text-accent font-semibold">📩 Contact us for pricing — Request a Quote</p>}

            <div className="flex flex-wrap gap-3">
              {!isFarmer && (
                <button onClick={() => navigate(`/order/${product.id}`)} className="gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition">
                  {isInternational ? 'Request Quote' : 'Place Order'}
                </button>
              )}
              <button onClick={() => openWhatsAppRandom(product.name)} className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </button>
            </div>

            {/* WhatsApp Direct Contacts */}
            <div className="border-t border-input pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Contact our team directly:</p>
              <div className="flex flex-wrap gap-2">
                {ADMIN_LABELS.map((label, i) => (
                  <button key={i} onClick={() => openWhatsAppDirect(i, product.name)} className="text-xs px-3 py-1.5 rounded-lg border border-input text-foreground hover:bg-muted transition">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ProductDetail;
