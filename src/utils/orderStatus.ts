import type { OrderStatus } from '../types'

// Cómo se muestra cada estado al usuario
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

// Los pasos del seguimiento, en orden. "cancelled" no es un paso: es una salida del recorrido
export const STEPS: OrderStatus[] = ['pending', 'processing', 'completed']

// En qué paso va una orden (devuelve -1 si está cancelada)
export function stepIndex(status: OrderStatus): number {
  return STEPS.indexOf(status)
}