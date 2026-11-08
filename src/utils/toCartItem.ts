import type { CartItem, Product } from '../types';

// Convierte un Product en lo que necesita el carrito (sin cantidad: la pone el reducer)
export function toCartItem(p: Product): Omit<CartItem, 'quantity'> {
  return {
    productId: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl ?? '',  // Firestore no acepta "undefined", por eso el texto vacío de respaldo
    emoji: p.emoji ?? '🎾',
  };
}