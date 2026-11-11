import type { CartItem, Product } from '../types';

export function toCartItem(p: Product): Omit<CartItem, 'quantity'> {
  return {
    productId: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl ?? '',
    imageKey: p.imageKey ?? '',
    emoji: p.emoji ?? '🎾',
    stock: p.stock ?? 0,          // NUEVO: el tope viaja con el ítem
  };
}