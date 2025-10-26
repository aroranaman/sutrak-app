'use client';

import { useAuth } from './use-auth';

/**
 * @deprecated use `useAuth` instead. This will be removed in a future update.
 */
export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}
