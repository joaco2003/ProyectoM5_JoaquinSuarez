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
      const exists = state.find((i) => i.productId === action.item.productId)
      if (exists) // Si ya estaba, sumamos 1 a la cantidad
        return state.map((i) => (i.productId === exists.productId ? { ...i, quantity: i.quantity + 1 } : i))
      return [...state, { ...action.item, quantity: 1 }] // Si no, lo agregamos
    }
    case 'REMOVE':
      return state.filter((i) => i.productId !== action.productId)
    case 'SET_QTY':
      return state
        .map((i) => (i.productId === action.productId ? { ...i, quantity: action.quantity } : i))
        .filter((i) => i.quantity > 0) // Si la cantidad llega a 0, se elimina
    case 'CLEAR':
      return []
  }
}

// Total en pesos del carrito
export function getTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}