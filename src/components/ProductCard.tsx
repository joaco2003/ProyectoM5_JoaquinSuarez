import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toCartItem } from '../utils/toCartItem';
import type { Product } from '../types';
import ProductImage from '../components/ProductImage';

export default function ProductCard({ product: p }: { product: Product }) {
  const { dispatch } = useCart();
  const noStock = (p.stock ?? 0) <= 0;   // true si no quedan unidades

  return (
    <div className="card product-card">
      <Link to={`/product/${p.id}`} className="product-link">
  <div className="img-box">
    <ProductImage imageKey={p.imageKey} imageUrl={p.imageUrl} emoji={p.emoji} alt={p.name} imgClass="product-img" emojiClass="product-emoji" />
  </div>
  <div className="product-info">
    <h3 className="product-name">{p.name}</h3>
    <p className="product-price">${p.price.toLocaleString('es-AR')}</p>
  </div>
</Link>
      {/* Sin stock el botón se desactiva y cambia el texto */}
      <button className="primary-btn product-add" disabled={noStock}
        onClick={() => dispatch({ type: 'ADD', item: toCartItem(p) })}>
        {noStock ? 'Sin stock' : 'Agregar'}
      </button>
    </div>
  );
}