'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * Hook to listen to a single Firestore document.
 * @param ref - The document reference to listen to.
 * @param options - Optional configuration (e.g., silent errors).
 */
export function useDoc<T = DocumentData>(
  ref: DocumentReference<T> | null, 
  options: { silent?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<T>) => {
        setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null);
        setLoading(false);
      },
      async (serverError: FirestoreError) => {
        const isPermissionError = serverError.code === 'permission-denied';
        
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });

        // Only emit global error toast if not in silent mode
        if (!options.silent) {
          errorEmitter.emit('permission-error', permissionError);
        }

        setError(permissionError);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [ref, options.silent]);

  return { data, loading, error };
}
