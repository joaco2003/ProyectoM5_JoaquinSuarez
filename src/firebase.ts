import { initializeApp } from 'firebase/app';  // Inicia la conexión con Firebase
import { getAuth } from 'firebase/auth';       // Módulo de autenticación
import { getFirestore } from 'firebase/firestore'; // Módulo de base de datos

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,         // Las credenciales vienen del archivo .env
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // (nunca se escriben directo en el código)
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
export const auth = getAuth(app);   // Exportamos auth para usarlo en la app
export const db = getFirestore(app); // Exportamos la base de datos
