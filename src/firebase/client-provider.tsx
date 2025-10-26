'use client';

import type { ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

/**
 * This is a client-side only wrapper that ensures the FirebaseProvider
 * and its children are only rendered on the client.
 */
export function FirebaseProviderWrapper({ children }: { children: ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
