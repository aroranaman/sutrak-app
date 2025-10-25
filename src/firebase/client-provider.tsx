'use client';

import { firebaseConfig } from './config';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import type { ReactNode } from 'react';

// Initialize Firebase on the client
const { app, auth, firestore } = initializeFirebase(firebaseConfig);

export function FirebaseProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
