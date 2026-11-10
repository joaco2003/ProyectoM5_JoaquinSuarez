import { describe, it, expect } from 'vitest'
import { STEPS, stepIndex, STATUS_LABEL } from './orderStatus'

describe('orderStatus', () => {
  it('los pasos del seguimiento van de pendiente a completada', () => {
    expect(STEPS).toEqual(['pending', 'processing', 'completed'])
  })

  it('stepIndex devuelve la posición de cada estado', () => {
    expect(stepIndex('pending')).toBe(0)
    expect(stepIndex('processing')).toBe(1)
    expect(stepIndex('completed')).toBe(2)
  })

  it('una orden cancelada no está en ningún paso', () => {
    expect(stepIndex('cancelled')).toBe(-1)
  })

  it('todos los estados tienen un texto para mostrar', () => {
    expect(STATUS_LABEL.cancelled).toBe('Cancelada')
  })
})