import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers() })   // Relojes falsos: controlamos el tiempo, sin esperar de verdad
  afterEach(() => { vi.useRealTimers() })

  it('devuelve el valor inicial enseguida', () => {
    const { result } = renderHook(() => useDebounce('pala', 400))
    expect(result.current).toBe('pala')
  })

  it('actualiza el valor recién cuando pasa el tiempo de espera', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'pa' },
    })
    rerender({ value: 'pala' })                       // El usuario siguió escribiendo
    expect(result.current).toBe('pa')                 // Todavía no se actualiza
    act(() => { vi.advanceTimersByTime(400) })        // "Pasan" 400 ms
    expect(result.current).toBe('pala')               // Ahora sí
  })
})