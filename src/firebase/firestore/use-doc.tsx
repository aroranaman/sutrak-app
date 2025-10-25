'use client';

import {
  onSnapshot,
  docEqual,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useMemoFirebase } from '@/firebase/memo';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export type UseDocOptions = {
  deps?: any[];
};

export function useDoc<T>(
  ref: DocumentReference<T, DocumentData> | null,
  options?: UseDocOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const docRef = useRef<DocumentReference<T, DocumentData> | null>(null);

  const memoRef = useMemoFirebase(() => {
    return ref;
  }, [ref, ...(options?.deps || [])]);

  useEffect(() => {
    if (memoRef === null) {
      setData(null);
      setLoading(false);
      return;
    }
    
    if (docRef.current && docEqual(docRef.current, memoRef)) {
      return;
    }

    docRef.current = memoRef;
    setLoading(true);

    const unsubscribe = onSnapshot(
      memoRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data());
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: memoRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoRef]);

  return { 
    data, 
    loading, 
    error,
    status: loading ? 'loading' : error ? 'error' : 'success',
  };
}
