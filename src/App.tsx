import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import OrderPage from "./pages/OrderPage";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Shipment from "./pages/Shipment";
import ChatPage from "./pages/ChatPage";
import ShastikaChatbot from "./pages/cocobot";
import Verification from "./pages/Verification";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Notifications from "./pages/Notifications";
import FarmerDashboard from "./pages/FarmerDashboard";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import WaitingForApproval from "./pages/WaitingForApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  const { isLoading, isAccessDenied, denialReason } = useProtectedRoute();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">{t('loading')}</div>
        </div>
      </AppLayout>
    );
  }

  if (isAccessDenied) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-destructive font-semibold mb-2">{denialReason}</p>
            <p className="text-muted-foreground text-sm">{t('redirect_login')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentUser) return <Navigate to="/" replace />;

  return <AppLayout>{children}</AppLayout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const FarmerRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  if (!currentUser || currentUser.role !== 'farmer') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

// ✅ Firebase auth state restore பண்ணு
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { setCurrentUser, currentUser } = useStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !currentUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCurrentUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || '',
              email: userData.email || firebaseUser.email || '',
              phone: userData.phone || '',
              country: userData.country || 'India',
              role: userData.role || 'buyer',
              status: userData.status || 'pending',
              userType: userData.userType || 'domestic',
              verified: true,
            });
          }
        } catch (error) {
          console.error('Auth restore error:', error);
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/waiting-for-approval" element={<WaitingForApproval />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/payment-confirmation" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/shipment" element={<ProtectedRoute><Shipment /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/shastika-chatbot" element={<ProtectedRoute><ShastikaChatbot /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/farmer-dashboard" element={<FarmerRoute><FarmerDashboard /></FarmerRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;