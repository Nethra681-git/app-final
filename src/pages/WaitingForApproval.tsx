import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import logo from '@/assets/logo.webp';
import { Mail, Clock, AlertCircle, LogOut } from 'lucide-react';

const WaitingForApproval = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();
  const [status, setStatus] = useState<'pending' | 'checking' | 'error'>('checking');
  const auth = getAuth();

  // Real-time listener for user approval status
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Set up real-time listener on user document
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.id),
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Check if user has been approved
          if (userData.status === 'approved') {
            // User approved! Update store and redirect
            setCurrentUser({
              ...currentUser,
              status: 'approved'
            });
            navigate('/dashboard');
          } else if (userData.status === 'rejected' || userData.status === 'disabled') {
            // User was rejected/disabled
            setStatus('error');
          }
        }
      },
      (error) => {
        console.error('Error listening to user status:', error);
        setStatus('error');
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser, navigate, setCurrentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Shastika Global" className="w-20 h-20 object-contain mb-3" />
            <h1 className="text-xl font-bold text-primary">SHASTIKA GLOBAL IMPEX</h1>
            <p className="text-sm text-muted-foreground">Agriculture Export Marketplace</p>
          </div>

          {/* Status Messages */}
          <div className="space-y-4">
            {/* Waiting State */}
            {status === 'checking' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center animate-pulse">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-foreground">Waiting for Approval</h2>
                <p className="text-sm text-muted-foreground">
                  Your account is pending admin approval. We'll notify you via email once your account is approved.
                </p>
                <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-left">
                  <p className="text-xs text-info font-medium flex items-start gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Check your email at <strong>{currentUser?.email}</strong> for approval notification</span>
                  </p>
                </div>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-destructive">Unable to Verify Status</h2>
                <p className="text-sm text-muted-foreground">
                  There was an error checking your approval status. Please try reloading the page.
                </p>
              </>
            )}

            {/* Auto-check Info */}
            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
              <p>� Real-time updates enabled</p>
              <p className="mt-1">You'll be notified instantly when approved</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-lg font-medium transition border border-input text-foreground hover:bg-muted flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout & Go Back
        </button>
      </div>
    </div>
  );
};

export default WaitingForApproval;
