import type { CartItem } from '../types'

// Todas las acciones posibles sobre el carrito
export type CartAction =
  | { type: 'ADD'; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }

// Recibe el carrito actual y una acción, y devuelve el carrito nuevo (sin modificar el anterior)
export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const max = action.item.stock ?? Infinity          // Sin dato de stock (carritos viejos), no hay tope
      const exists = state.find((i) => i.productId === action.item.productId)
      if (exists) {
        if (exists.quantity >= max) return state         // Ya está al máximo: no cambia nada
        return state.map((i) => (i.productId === exists.productId ? { ...i, quantity: i.quantity + 1 } : i))
      }
      if (max <= 0) return state                         // Sin stock: ni siquiera entra al carrito
      return [...state, { ...action.item, quantity: 1 }]
    }
    case 'REMOVE':
      return state.filter((i) => i.productId !== action.productId)
    case 'SET_QTY':
      return state
        .map((i) => (i.productId === action.productId
          ? { ...i, quantity: Math.min(action.quantity, i.stock ?? Infinity) } // Nunca más que el stock
          : i))
        .filter((i) => i.quantity > 0)
    case 'CLEAR':
      return []
  }
}

// Total en pesos del carrito
export function getTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}