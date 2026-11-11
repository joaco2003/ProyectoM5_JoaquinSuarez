import { collection, addDoc, getDocs, getDoc, query, where, doc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import type { CartItem, Order, OrderStatus } from '../types';

// Crea la orden Y descuenta el stock en una sola operación: o se hace todo o no se hace nada
export async function createOrder(userId: string, items: CartItem[], total: number) {
  await runTransaction(db, async (tx) => {
    const refs = items.map((i) => doc(db, 'products', i.productId));   // Referencia a cada producto comprado
    const snaps = await Promise.all(refs.map((r) => tx.get(r)));        // 1) PRIMERO se lee el stock actual

    snaps.forEach((s, n) => {
      const stock = s.exists() ? (s.data().stock ?? 0) : 0;             // Stock real hoy (0 si no existe)
      if (stock < items[n].quantity)                                    // Si piden más de lo que hay...
        throw new Error(`No hay stock suficiente de ${items[n].name}`); // ...cancelamos todo con un mensaje
    });

    // 2) DESPUÉS se escribe: se descuenta lo comprado de cada producto
    snaps.forEach((s, n) => tx.update(refs[n], { stock: (s.data()!.stock ?? 0) - items[n].quantity }));

    // Y se crea la orden
    tx.set(doc(collection(db, 'orders')), { userId, items, total, status: 'pending', createdAt: Date.now() });
  });
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(db, 'orders'));
  const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status });
}

// NUEVO: borra una orden
export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, 'orders', id));
}
// Trae UNA orden por su ID (null si no existe)
export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
}