import { describe, it, expect } from 'vitest'
import { cartReducer, getTotal } from './cartReducer'
import type { CartItem } from '../types'

// Productos de ejemplo para usar en los tests
const pala = { productId: 'p1', name: 'Pala Pro', price: 100 }
const pelota = { productId: 'p2', name: 'Pelotas', price: 10 }
// Arma un ítem de carrito con la cantidad indicada
const itemOf = (p: typeof pala, quantity: number): CartItem => ({ ...p, quantity })

describe('cartReducer', () => {
  it('ADD agrega un producto nuevo con cantidad 1', () => {
    const result = cartReducer([], { type: 'ADD', item: pala })
    expect(result).toEqual([itemOf(pala, 1)])
  })

  it('ADD de un producto que ya está suma 1 a la cantidad', () => {
    const result = cartReducer([itemOf(pala, 1)], { type: 'ADD', item: pala })
    expect(result).toHaveLength(1)                    // No duplica la fila
    expect(result[0].quantity).toBe(2)
  })

  it('ADD de un producto distinto lo suma a la lista', () => {
    const result = cartReducer([itemOf(pala, 1)], { type: 'ADD', item: pelota })
    expect(result.map((i) => i.productId)).toEqual(['p1', 'p2'])
  })

  it('SET_QTY cambia la cantidad', () => {
    const result = cartReducer([itemOf(pala, 1)], { type: 'SET_QTY', productId: 'p1', quantity: 5 })
    expect(result[0].quantity).toBe(5)
  })

  it('SET_QTY con cantidad 0 elimina el producto', () => {
    const result = cartReducer([itemOf(pala, 1)], { type: 'SET_QTY', productId: 'p1', quantity: 0 })
    expect(result).toEqual([])
  })

  it('REMOVE saca solo el producto indicado', () => {
    const state = [itemOf(pala, 1), itemOf(pelota, 2)]
    const result = cartReducer(state, { type: 'REMOVE', productId: 'p1' })
    expect(result).toEqual([itemOf(pelota, 2)])
  })

  it('CLEAR vacía el carrito', () => {
    const result = cartReducer([itemOf(pala, 1), itemOf(pelota, 2)], { type: 'CLEAR' })
    expect(result).toEqual([])
  })

  it('no modifica el estado anterior (inmutabilidad)', () => {
    const before = [itemOf(pala, 1)]
    cartReducer(before, { type: 'ADD', item: pala })
    expect(before[0].quantity).toBe(1)                // El carrito original sigue igual
  })
    it('ADD no pasa del stock disponible', () => {
    const limitado = { ...pala, stock: 2 }
    let state = cartReducer([], { type: 'ADD', item: limitado })
    state = cartReducer(state, { type: 'ADD', item: limitado })
    state = cartReducer(state, { type: 'ADD', item: limitado })   // El tercero ya no entra
    expect(state[0].quantity).toBe(2)
  })

  it('ADD de un producto sin stock no entra al carrito', () => {
    expect(cartReducer([], { type: 'ADD', item: { ...pala, stock: 0 } })).toEqual([])
  })

  it('SET_QTY recorta la cantidad al stock', () => {
    const state: CartItem[] = [{ ...pala, quantity: 1, stock: 3 }]
    const result = cartReducer(state, { type: 'SET_QTY', productId: 'p1', quantity: 10 })
    expect(result[0].quantity).toBe(3)
  })
})

describe('getTotal', () => {
  it('suma precio por cantidad de cada producto', () => {
    expect(getTotal([itemOf(pala, 2), itemOf(pelota, 3)])).toBe(230) // 100*2 + 10*3
  })

  it('devuelve 0 con el carrito vacío', () => {
    expect(getTotal([])).toBe(0)
  })
})