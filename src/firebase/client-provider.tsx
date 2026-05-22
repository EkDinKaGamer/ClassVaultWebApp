
'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { RefreshCw, Settings2, ShieldAlert } from 'lucide-react';

/**
 * FirebaseClientProvider
 * 
 * Handles Firebase initialization with robust error checking for both
 * production builds and runtime execution.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<{
    app: FirebaseApp;
    db: Firestore;
    storage: FirebaseStorage;
  } | null>(null);
  const [error, setError] = useState<{ title: string; message: string; type: 'config' | 'connection' } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Safety check for required Firebase config keys
    const requiredKeys = ['apiKey', 'projectId', 'appId'];
    const missingKeys = requiredKeys.filter(key => 
      !firebaseConfig[key as keyof typeof firebaseConfig] || 
      firebaseConfig[key as keyof typeof firebaseConfig] === "undefined" ||
      firebaseConfig[key as keyof typeof firebaseConfig] === ""
    );

    // If config is missing in production, we must show an error to avoid a white screen (infinite loading)
    if (missingKeys.length > 0) {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
        setError({
          type: 'config',
          title: "Vault Config Missing",
          message: "The application environment variables are not detected. Please ensure NEXT_PUBLIC_FIREBASE_* keys are added to your Vercel/Netlify dashboard."
        });
      }
      return;
    }

    try {
      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
      
      const db = getFirestore(app);
      const storage = getStorage(app);
      setServices({ app, db, storage });
    } catch (err: any) {
      console.error('Firebase Initialization Error:', err);
      setError({
        type: 'connection',
        title: "Vault Connection Error",
        message: "We couldn't reach the secure resource vault. Please check your network connection."
      });
    }
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-background" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border text-center space-y-6 animate-in fade-in zoom-in">
          <div className="bg-rose-50 dark:bg-rose-900/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-rose-600">
            {error.type === 'config' ? <Settings2 className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold">{error.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" /> Retry Sync
          </button>
        </div>
      </div>
    );
  }

  // Fallback for missing services (e.g. during build)
  if (!services) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider app={services.app} db={services.db} storage={services.storage}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
