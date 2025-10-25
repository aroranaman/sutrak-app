'use client';

import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

import { useFirebaseApp } from '@/firebase/provider';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [auth, router]);

  return { user, loading, signOut, auth };
}
