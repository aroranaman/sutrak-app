
'use client';

import { app } from '@/lib/firebaseClient';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FirebaseProvider } from './provider';
import type { ReactNode } from 'react';

// Re-exporting the auth instance from the central client file
import { auth } from '@/lib/firebaseClient';

const firestore = getFirestore(app);

export function FirebaseProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
