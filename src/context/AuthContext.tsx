import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider,           
  signOut, type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Role } from '../types';

interface AuthValue {
  user: User | null;
  role: Role | null;
  isAdmin: boolean;
  loading: boolean;
  login: (e: string, p: string) => Promise<unknown>;
  register: (e: string, p: string) => Promise<unknown>;
  loginWithGoogle: () => Promise<void>;          
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          setRole(snap.exists() ? (snap.data().role as Role) : 'customer');
        } catch { setRole('customer'); }
      } else setRole(null);
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value: AuthValue = {
    user, role, isAdmin: role === 'admin', loading,
    login: (e, p) => signInWithEmailAndPassword(auth, e, p),
    register: async (email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), { email, role: 'customer' });
    },
   
    loginWithGoogle: async () => {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider()); // Abre la ventanita de Google
      const ref = doc(db, 'users', cred.user.uid);                        // Perfil de este usuario en Firestore
      const snap = await getDoc(ref);                                     // ¿Ya tenía perfil?
      if (!snap.exists())                                                 // Solo si es la primera vez...
        await setDoc(ref, { email: cred.user.email, role: 'customer' });  // ...se lo crea como customer
    },
    logout: () => signOut(auth),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}