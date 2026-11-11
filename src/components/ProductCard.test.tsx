import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard'
import type { CartItem, Product } from '../types'

// vi.hoisted crea estos objetos antes de que se ejecuten los mocks
const { dispatch, cart } = vi.hoisted(() => ({ dispatch: vi.fn(), cart: { items: [] as CartItem[] } }))

// Carrito falso: items se lee en cada render, así cada test puede cambiarlo
vi.mock('../context/CartContext', () => ({ useCart: () => ({ items: cart.items, dispatch }) }))
vi.mock('./ProductImage', () => ({ default: () => null }))

const product: Product = { id: 'p1', name: 'Pala Neuron', price: 190000, category: 'Palas', emoji: '🏓', stock: 5 }
const renderCard = (p: Product) => render(<MemoryRouter><ProductCard product={p} /></MemoryRouter>)

describe('ProductCard', () => {
  beforeEach(() => { cart.items = [] })                    // Cada test arranca con el carrito vacío

  it('muestra el nombre y el precio formateado', () => {
    renderCard(product)
    expect(screen.getByText('Pala Neuron')).toBeInTheDocument()
    expect(screen.getByText(/190\.000/)).toBeInTheDocument()
  })

  it('con stock, el botón Agregar está habilitado', () => {
    renderCard(product)
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeEnabled()
  })

  it('al tocar Agregar manda la acción ADD al carrito', async () => {
    const user = userEvent.setup()
    renderCard(product)
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADD', item: expect.objectContaining({ productId: 'p1' }) }),
    )
  })

  it('sin stock, el botón dice "Sin stock", está deshabilitado y no agrega', async () => {
    const user = userEvent.setup()
    renderCard({ ...product, stock: 0 })
    const btn = screen.getByRole('button', { name: 'Sin stock' })
    expect(btn).toBeDisabled()
    await user.click(btn)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('si ya agregaste todo el stock, el botón se deshabilita', () => {
    cart.items = [{ productId: 'p1', name: 'Pala Neuron', price: 190000, quantity: 5 }]
    renderCard(product)                                    // stock 5 y ya hay 5 en el carrito
    expect(screen.getByRole('button', { name: 'Máximo en el carrito' })).toBeDisabled()
  })
})