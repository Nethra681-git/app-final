import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { checkUserAccess } from '@/lib/userService';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseProtectedRouteReturn {
  isLoading: boolean;
  isAccessDenied: boolean;
  denialReason: string;
}

/**
 * Hook to check if user has access to protected routes
 * Redirects to waiting page if pending approval
 * Returns to login if not authenticated
 */
export const useProtectedRoute = (): UseProtectedRouteReturn => {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // If no current user, redirect to login
        if (!currentUser) {
          navigate('/', { replace: true });
          return;
        }

        // Check approval status from Firestore
        const accessCheck = await checkUserAccess(currentUser.id);

        if (!accessCheck.allowed) {
          // User doesn't have access
          if (accessCheck.status === 'pending') {
            // Redirect to waiting page for pending users
            setDenialReason(accessCheck.message);
            navigate('/waiting-for-approval', { replace: true });
          } else if (accessCheck.status === null) {
            // User document not found - try to create it from local user data
            try {
              await setDoc(doc(db, 'users', currentUser.id), {
                ...currentUser,
                createdAt: new Date().toISOString()
              });
              // Recheck after creating
              const recheckAccess = await checkUserAccess(currentUser.id);
              if (recheckAccess.allowed) {
                setIsLoading(false);
                return;
              }
              if (recheckAccess.status === 'pending') {
                navigate('/waiting-for-approval', { replace: true });
              }
            } catch (error) {
              console.error('Error creating missing user document:', error);
              setIsAccessDenied(true);
              setDenialReason('Unable to verify account. Please contact support.');
              setTimeout(() => {
                navigate('/', { replace: true });
              }, 5000);
            }
          } else {
            // For rejected/disabled users, show denial reason and redirect to login
            setIsAccessDenied(true);
            setDenialReason(accessCheck.message);
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 5000);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying access:', error);
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [currentUser, navigate]);

  return { isLoading, isAccessDenied, denialReason };
};
