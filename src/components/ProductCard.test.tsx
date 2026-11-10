import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard'
import type { Product } from '../types'

// vi.hoisted crea el espía antes de que se ejecuten los mocks
const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }))

// Carrito falso: solo nos interesa saber si se llamó a dispatch y con qué
vi.mock('../context/CartContext', () => ({ useCart: () => ({ dispatch }) }))
// La foto pide links a S3 y a Firebase; la reemplazamos por algo vacío
vi.mock('./ProductImage', () => ({ default: () => null }))

const product: Product = {
  id: 'p1', name: 'Pala Neuron', price: 190000, category: 'Palas', emoji: '🏓', stock: 5,
}

// La card usa <Link>, que necesita estar dentro de un Router
const renderCard = (p: Product) =>
  render(<MemoryRouter><ProductCard product={p} /></MemoryRouter>)

describe('ProductCard', () => {
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
    const user = userEvent.setup()                     // Simula a una persona usando la pantalla
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
})