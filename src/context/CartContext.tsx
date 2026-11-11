import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { cartReducer, getTotal, type CartAction } from './cartReducer' // La lógica ahora vive en su archivo
import type { CartItem } from '../types'

interface CartValue { items: CartItem[]; total: number; dispatch: Dispatch<CartAction> }
const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  // El 3er parámetro carga el carrito guardado en el navegador (si existe)
  const [items, dispatch] = useReducer(cartReducer, [], () => {
    try { return JSON.parse(localStorage.getItem('cart') ?? '[]') as CartItem[] } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)) }, [items]) // Guarda en cada cambio
  return <CartContext.Provider value={{ items, total: getTotal(items), dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
