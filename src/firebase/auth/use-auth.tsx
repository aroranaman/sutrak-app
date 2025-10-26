
'use client';

import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // User will be redirected via the onAuthStateChanged listener
      // No need to push router here, it can cause race conditions.
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [router]);

  return { user, loading, signOut, auth };
}
