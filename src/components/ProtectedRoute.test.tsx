import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { User } from 'firebase/auth'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'

// Reemplazamos useAuth por una función falsa: así no se conecta a Firebase
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const fakeUser = { uid: 'u1', email: 'cliente@mail.com' } as User

// Define cómo responde useAuth en cada test; lo que no se indica queda como "sin sesión"
function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: null, role: null, isAdmin: false, loading: false,
    login: vi.fn(), register: vi.fn(), loginWithGoogle: vi.fn(), logout: vi.fn(),
    ...overrides,
  })
}

// Dibuja una mini app con rutas y empieza en "/secreto"
function renderProtected(adminOnly = false) {
  render(
    <MemoryRouter initialEntries={['/secreto']}>
      <Routes>
        <Route path="/" element={<p>Pantalla de inicio</p>} />
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route element={<ProtectedRoute adminOnly={adminOnly} />}>
          <Route path="/secreto" element={<p>Contenido privado</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('muestra "Cargando..." mientras Firebase revisa la sesión', () => {
    mockAuth({ loading: true })
    renderProtected()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('sin sesión redirige a /login', () => {
    mockAuth()
    renderProtected()
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('con sesión muestra el contenido', () => {
    mockAuth({ user: fakeUser, role: 'customer' })
    renderProtected()
    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
  })

  it('en una ruta de admin, un cliente vuelve al inicio', () => {
    mockAuth({ user: fakeUser, role: 'customer', isAdmin: false })
    renderProtected(true)
    expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('en una ruta de admin, un admin entra', () => {
    mockAuth({ user: fakeUser, role: 'admin', isAdmin: true })
    renderProtected(true)
    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
  })
})