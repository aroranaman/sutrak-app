'use client';

import {
  onSnapshot,
  query,
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
  q: Query<T, DocumentData> | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const previousQueryPathAndOptionsRef = useRef<string | null>(null);

  const memoQuery = useMemoFirebase(() => {
    return q;
  }, [q, ...(options?.deps || [])]);
  
  const getQueryPathAndOptions = (query: Query<T, DocumentData>): string => {
    // A simplified representation of the query object for comparison.
    // This is not a complete representation but covers common cases.
    const queryAsAny = query as any;
    const path = queryAsAny._query.path.segments.join('/');
    const filters = (queryAsAny._query.filters || []).map((f: any) => `${f.field.segments.join('.')}${f.op}${f.value}`).join(',');
    const orderings = (queryAsAny._query.explicitOrderBy || []).map((o: any) => `${o.field.segments.join('.')}${o.dir}`).join(',');

    return `${path}|${filters}|${orderings}`;
  }

  useEffect(() => {
    if (memoQuery === null) {
      setData(null);
      setLoading(false);
      return;
    }
    
    const currentQueryPathAndOptions = getQueryPathAndOptions(memoQuery);
    if (previousQueryPathAndOptionsRef.current === currentQueryPathAndOptions) {
      // The query itself hasn't changed, so no need to re-subscribe.
      return;
    }
    previousQueryPathAndOptionsRef.current = currentQueryPathAndOptions;

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
          path: (memoQuery as any)._query.path.segments.join('/'),
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
