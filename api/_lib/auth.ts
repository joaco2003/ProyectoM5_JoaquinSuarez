import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { VercelRequest } from '@vercel/node';

// Inicia Firebase Admin una sola vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Restaura los saltos de línea de la clave
    }),
  });
}

// Lanza un error si quien llama no es un administrador logueado
export async function requireAdmin(req: VercelRequest): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';   // El token viene como "Bearer xxxxx"
  if (!token) throw new Error('Sin token');
  const decoded = await getAuth().verifyIdToken(token);                 // Google confirma que el token es auténtico
  const snap = await getFirestore().doc(`users/${decoded.uid}`).get();  // Buscamos su perfil
  if (snap.data()?.role !== 'admin') throw new Error('No es admin');    // Solo pasa si su rol es admin
}