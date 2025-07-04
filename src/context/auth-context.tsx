'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'patrickekw@gmail.com';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase no está configurado. Agregue sus credenciales al archivo .env.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email === ADMIN_EMAIL);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    if (!auth) {
      return Promise.reject(new Error("Firebase no está configurado. Agregue sus credenciales al archivo .env."));
    }
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const register = (email: string, pass: string) => {
    if (!auth) {
      return Promise.reject(new Error("Firebase no está configurado. Agregue sus credenciales al archivo .env."));
    }
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = () => {
    if (!auth) {
      router.push('/login');
      return Promise.resolve();
    }
    return signOut(auth).then(() => {
      setIsAdmin(false);
      router.push('/login');
    });
  }

  const value = {
    user,
    isAdmin,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
