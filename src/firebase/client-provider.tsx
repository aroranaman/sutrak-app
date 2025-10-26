
'use client';

import { app, auth, firestore } from '@/lib/firebaseClient';
import { FirebaseProvider } from './provider';
import type { ReactNode } from 'react';

export function FirebaseProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
