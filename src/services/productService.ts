import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Product } from '../types';

// Trae todos los productos
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
}

// NUEVO: trae UN producto por su ID (devuelve null si no existe)
export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));       // Pedimos el documento
  if (!snap.exists()) return null;                          // Si no existe, null
  return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
}

export async function createProduct(p: Omit<Product, 'id'>): Promise<void> {
  await addDoc(collection(db, 'products'), p);
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

// Carga ejemplos solo si no hay ningún producto (así no se duplican)
export async function seedProducts(): Promise<void> {
  const existing = await getDocs(collection(db, 'products'));
  if (!existing.empty) return;
  const demo: Omit<Product, 'id'>[] = [
    { name: 'Pala Pro 3K', price: 180000, category: 'Palas', emoji: '🏓' },
    { name: 'Pala Control Plus', price: 140000, category: 'Palas', emoji: '🏓' },
    { name: 'Pack 3 Pelotas', price: 9000, category: 'Pelotas', emoji: '🎾' },
    { name: 'Zapatillas Court', price: 95000, category: 'Calzado', emoji: '👟' },
    { name: 'Paletero Team', price: 60000, category: 'Accesorios', emoji: '🎒' },
  ];
  for (const p of demo) await addDoc(collection(db, 'products'), p);
}