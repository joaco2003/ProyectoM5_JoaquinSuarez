import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { createOrder } from '../services/orderService';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { items, total, dispatch } = useCart();
  const { user } = useAuth();
  const { refresh } = useOrders();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');                     // Mensaje si la compra falla (ej: sin stock)

  async function checkout() {
    if (!user) return navigate('/login');
    setPaying(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 1000));          // Pago simulado
      await createOrder(user.uid, items, total);              // Crea la orden y descuenta stock
      await refresh();
      dispatch({ type: 'CLEAR' });
      navigate('/orders');
    } catch (e) {
      // Si falló, mostramos el motivo (el texto del Error que lanzamos en createOrder)
      setError(e instanceof Error ? e.message : 'No se pudo completar la compra');
    } finally {
      setPaying(false);                                        // Pase lo que pase, reactivamos el botón
    }
  }

  if (items.length === 0) return <p>Tu carrito está vacío. <Link to="/products">Ver productos</Link></p>;

  return (
    <div className="card">
      <h2 className="title">Checkout</h2>
      {items.map((i) => (
        <div key={i.productId} className="row">
          <div className="row-info">
            {/* Foto chiquita; si no hay, el emoji. Los carritos viejos no tienen emoji, de ahí el respaldo */}
            <ProductImage imageKey={i.imageKey} imageUrl={i.imageUrl} emoji={i.emoji} alt={i.name} imgClass="thumb-sm" emojiClass="thumb-sm thumb-emoji" />
            <div>
              <p className="bold">{i.name}</p>
              <p className="muted small">${i.price.toLocaleString('es-AR')} c/u</p>
            </div>
          </div>
          <div className="qty">
            <button className="icon-btn" onClick={() => dispatch({ type: 'SET_QTY', productId: i.productId, quantity: i.quantity - 1 })}>➖</button>
            <span>{i.quantity}</span>
            <button className="icon-btn" onClick={() => dispatch({ type: 'SET_QTY', productId: i.productId, quantity: i.quantity + 1 })}>➕</button>
            <button className="icon-btn" onClick={() => dispatch({ type: 'REMOVE', productId: i.productId })}>🗑️</button>
          </div>
          <p className="bold">${(i.price * i.quantity).toLocaleString('es-AR')}</p>
        </div>
      ))}
      <p className="total">Total: ${total.toLocaleString('es-AR')}</p>
      {error && <p className="error-msg">{error}</p>}
      <button className="primary-btn full" disabled={paying} onClick={checkout}>
        {paying ? 'Procesando pago...' : 'Confirmar compra'}
      </button>
    </div>
  );
}