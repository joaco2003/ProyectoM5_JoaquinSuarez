// "Contratos": la forma exacta de cada dato de la app.
export interface Product {
  id: string;        // ID del documento en Firestore
  name: string;      // Nombre, ej: "Pala Pro 3K"
  price: number;     // Precio
  category: string;  // Categoría para filtrar
  emoji: string;     // Usamos un emoji como "imagen" para simplificar
  imageUrl?: string; // Link a la foto del producto. El "?" significa que es opcional
  imageKey?: string;   // Nombre de la foto en S3 (ej: products/abc.jpg)
    extraImageKeys?: string[]; // Fotos adicionales en S3 (además de la principal)
  description?: string;  // Descripción corta del producto
  features?: string[];   // Lista de características (una por ítem)
    stock?: number;     // Unidades disponibles (si falta, se considera 0)
}
export interface CartItem {
  productId: string; // A qué producto corresponde
  name: string;      // Copia del nombre (denormalización: se guarda tal cual al comprar)
  price: number;     // Copia del precio al momento de agregar
  quantity: number;  // Cantidad
  imageUrl?: string;  // Foto chica para mostrar en el checkout
  emoji?: string;     // Emoji de respaldo si no hay foto
    imageKey?: string;
}
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'; // Estados permitidos
export interface Order {
  id: string;
  userId: string;    // Dueño de la orden
  items: CartItem[]; // Productos comprados
  total: number;
  status: OrderStatus;
  createdAt: number; // Fecha en milisegundos
}
export type Role = 'customer' | 'admin'; // Los dos únicos roles posibles

export interface Profile {      // Datos de contacto del usuario
  name: string;
  phone: string;
  address: string;
}