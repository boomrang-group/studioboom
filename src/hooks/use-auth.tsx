
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, authLoading] = useAuthState(auth);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setUserData(data);

          // Check subscription status
          const sub = data.subscription;
          if (sub && sub.status === 'active') {
            if (sub.endDate) {
              // Convert Firestore Timestamp to JS Date
              const endDate = (sub.endDate as Timestamp).toDate();
              if (endDate > new Date()) {
                setIsSubscribed(true);
              } else {
                // Subscription expired
                setIsSubscribed(false); 
              }
            } else {
              // Plan doesn't expire (e.g. Pay-as-you-go, or lifetime - though we don't have this yet)
              // For now, we assume non-expiring plans mean subscribed.
               setIsSubscribed(sub.plan !== 'gratuit');
            }
          } else {
            setIsSubscribed(false);
          }

        } else {
          setUserData(null);
          setIsSubscribed(false);
        }
        setDataLoading(false);
      });
      return () => unsubscribe();
    } else {
      setUserData(null);
      setIsSubscribed(false);
      setDataLoading(false);
    }
  }, [user]);

  const value = {
    user,
    userData,
    loading: authLoading || dataLoading,
    isSubscribed,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
