import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { CartItem } from '../types';

// Todas las acciones posibles sobre el carrito
type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' };

// El reducer recibe el carrito actual + una acción y devuelve el carrito nuevo
function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find((i) => i.productId === action.item.productId);
      if (exists) // Si ya estaba, sumamos 1 a la cantidad
        return state.map((i) => i.productId === exists.productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...state, { ...action.item, quantity: 1 }]; // Si no, lo agregamos
    }
    case 'REMOVE': return state.filter((i) => i.productId !== action.productId); // Lo sacamos
    case 'SET_QTY': return state
      .map((i) => i.productId === action.productId ? { ...i, quantity: action.quantity } : i)
      .filter((i) => i.quantity > 0); // Si la cantidad llega a 0, se elimina
    case 'CLEAR': return []; // Vaciar
  }
}

interface CartValue { items: CartItem[]; total: number; dispatch: Dispatch<Action>; }
const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // El 3er parámetro carga el carrito guardado en el navegador (si existe)
  const [items, dispatch] = useReducer(reducer, [], () => {
    try { return JSON.parse(localStorage.getItem('cart') ?? '[]') as CartItem[]; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]); // Guardamos en cada cambio
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0); // Total automático
  return <CartContext.Provider value={{ items, total, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
