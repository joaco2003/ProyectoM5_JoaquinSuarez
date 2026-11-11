import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toCartItem } from '../utils/toCartItem';
import ProductImage from './ProductImage';
import type { Product } from '../types';

export default function ProductCard({ product: p }: { product: Product }) {
  const { items, dispatch } = useCart();                         // NUEVO: items, para saber cuánto hay en el carrito
  const inCart = items.find((i) => i.productId === p.id)?.quantity ?? 0;
  const stock = p.stock ?? 0;
  const noStock = stock <= 0;
  const maxed = !noStock && inCart >= stock;                     // NUEVO: ya agregaste todo lo que hay

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
      <button className="primary-btn product-add" disabled={noStock || maxed}
        onClick={() => dispatch({ type: 'ADD', item: toCartItem(p) })}>
        {noStock ? 'Sin stock' : maxed ? 'Máximo en el carrito' : 'Agregar'}
      </button>
    </div>
  );
}