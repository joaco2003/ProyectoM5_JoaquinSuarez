import type { CartItem, Product } from '../types';

export function toCartItem(p: Product): Omit<CartItem, 'quantity'> {
  return {
    productId: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl ?? '',
    imageKey: p.imageKey ?? '',     // NUEVO: la foto de S3 también viaja al carrito
    emoji: p.emoji ?? '🎾',
  };
}