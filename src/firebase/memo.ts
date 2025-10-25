'use client';

import { useMemo } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  type QueryConstraint,
  type OrderByDirection,
} from 'firebase/firestore';

// Define a stable reference for an empty array to prevent re-renders
const EMPTY_ARRAY: any[] = [];

/**
 * A hook to memoize Firebase queries and references.
 * This is crucial to prevent infinite loops in `useEffect` when using `useCollection` or `useDoc`.
 *
 * @param factory A function that returns a Firestore query or document reference.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns The memoized query or document reference.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps || EMPTY_ARRAY);
}