'use client';

import { useAuth } from './use-auth';

/**
 * @deprecated use `useAuth` instead
 */
export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}
