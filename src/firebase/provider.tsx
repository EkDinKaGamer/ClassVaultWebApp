
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

export type Role = 'student' | 'premium-student' | 'admin' | null;

interface FirebaseContextValue {
  app: FirebaseApp | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  role: Role;
  setRole: (role: Role) => void;
  isLoadingRole: boolean;
  appCodes: { adminCode: string; premiumCode: string } | null;
  refreshAppCodes: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  db: null,
  storage: null,
  role: null,
  setRole: () => {},
  isLoadingRole: true,
  appCodes: null,
  refreshAppCodes: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useFirebase().app;
export const useFirestore = () => useFirebase().db;
export const useStorage = () => useFirebase().storage;
export const useRole = () => {
  const { role, setRole, isLoadingRole, appCodes, refreshAppCodes } = useFirebase();
  return { role, setRole, isLoadingRole, appCodes, refreshAppCodes };
};

export function FirebaseProvider({
  children,
  app,
  db,
  storage,
}: {
  children: ReactNode;
  app: FirebaseApp;
  db: Firestore;
  storage: FirebaseStorage;
}) {
  const [role, setRoleState] = useState<Role>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [appCodes, setAppCodes] = useState<{ adminCode: string; premiumCode: string } | null>(null);

  const fetchAppCodes = async () => {
    if (!db) return;
    try {
      const snap = await getDoc(doc(db, 'settings', 'accessControl'));
      if (snap.exists()) {
        setAppCodes(snap.data() as any);
      } else {
        setAppCodes({ adminCode: '234567', premiumCode: '345678' });
      }
    } catch (e) {
      console.error("Failed to fetch app codes", e);
      setAppCodes({ adminCode: '234567', premiumCode: '345678' });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('cv_role') as Role;
      const lastActive = localStorage.getItem('cv_last_active');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (savedRole && lastActive && now - parseInt(lastActive) > oneHour) {
        localStorage.removeItem('cv_role');
        localStorage.removeItem('cv_last_active');
        setRoleState(null);
      } else if (savedRole) {
        setRoleState(savedRole);
      }
    }
    setIsLoadingRole(false);
    fetchAppCodes();
  }, [db]);

  useEffect(() => {
    if (role && typeof window !== 'undefined') {
      localStorage.setItem('cv_last_active', Date.now().toString());
      
      const handleActivity = () => {
        localStorage.setItem('cv_last_active', Date.now().toString());
      };

      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keydown', handleActivity);
      
      return () => {
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('keydown', handleActivity);
      };
    }
  }, [role]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      if (newRole) {
        localStorage.setItem('cv_role', newRole);
        localStorage.setItem('cv_last_active', Date.now().toString());
      } else {
        localStorage.removeItem('cv_role');
        localStorage.removeItem('cv_last_active');
      }
    }
  };

  const contextValue = useMemo(() => ({
    app,
    db,
    storage,
    role,
    setRole,
    isLoadingRole,
    appCodes,
    refreshAppCodes: fetchAppCodes
  }), [app, db, storage, role, isLoadingRole, appCodes]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
