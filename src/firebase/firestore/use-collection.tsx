'use client';

import { useState, useEffect } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * Hook to listen to a Firestore collection or query.
 * @param query - The Firestore query to listen to.
 * @param options - Optional configuration (e.g., silent errors).
 */
export function useCollection<T = DocumentData>(
  query: Query<T> | null,
  options: { silent?: boolean } = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setLoading(false);
      },
      async (serverError: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
          path: (query as any)._query?.path?.toString() || 'unknown',
          operation: 'list',
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
  }, [query, options.silent]);

  return { data, loading, error };
}
