'use client';

import {
  onSnapshot,
  queryEqual,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useMemoFirebase } from '@/firebase/memo';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export type UseCollectionOptions = {
  deps?: any[];
};

export function useCollection<T>(
  query: Query<T, DocumentData> | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queryRef = useRef<Query<T, DocumentData> | null>(null);

  const memoQuery = useMemoFirebase(() => {
    return query;
  }, [query, ...(options?.deps || [])]);

  useEffect(() => {
    if (memoQuery === null) {
      setData(null);
      setLoading(false);
      return;
    }
    
    if (queryRef.current && queryEqual(queryRef.current, memoQuery)) {
      return;
    }

    queryRef.current = memoQuery;
    setLoading(true);

    const unsubscribe = onSnapshot(
      memoQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => doc.data());
        setData(docs);
        setLoading(false);
        setError(null);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: memoQuery.path,
          operation: 'list',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoQuery]);

  return {
    data,
    loading,
    error,
    status: loading ? 'loading' : error ? 'error' : 'success',
  };
}