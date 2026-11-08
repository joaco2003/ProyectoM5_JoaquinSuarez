import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toCartItem } from '../utils/toCartItem';
import type { Product } from '../types';

export default function ProductCard({ product: p }: { product: Product }) {
  const { dispatch } = useCart();
  const noStock = (p.stock ?? 0) <= 0;   // true si no quedan unidades

  return (
    <div className="card product-card">
      <Link to={`/product/${p.id}`} className="product-link">
        <div className="img-box">
          {p.imageUrl
            ? <img src={p.imageUrl} alt={p.name} className="product-img" />
            : <div className="product-emoji">{p.emoji}</div>}
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