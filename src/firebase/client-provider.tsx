'use client';

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { createContext, useContext, type ReactNode } from 'react';
import { app, auth, firestore } from '@/lib/firebaseClient'; // Import the singletons

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create context with the initialized singletons as the default value.
const FirebaseContext = createContext<FirebaseContextValue>({
  app,
  auth,
  firestore,
});

export function FirebaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = { app, auth, firestore };
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  // No need to check for context, as it's provided at the root with a default value.
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useFirestore() {
  return useFirebase().firestore;
}

// This wrapper is now correctly named and uses the simplified provider.
export function FirebaseProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
