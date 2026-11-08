import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toCartItem } from '../utils/toCartItem';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();                               // Para cambiar de página por código
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined = cargando
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { if (id) getProduct(id).then(setProduct); }, [id]);

  if (product === undefined) return <p>Cargando...</p>;
  if (product === null) return <p>Producto no encontrado. <Link to="/products">Volver</Link></p>;

  const stock = product.stock ?? 0;                             // Unidades disponibles

  // Agrega "qty" unidades al carrito
  const add = () => {
    for (let i = 0; i < qty; i++) dispatch({ type: 'ADD', item: toCartItem(product) });
  };
  const addToCart = () => {
    add();
    setAdded(true);                                             // Muestra el aviso 1,5 segundos
    setTimeout(() => setAdded(false), 1500);
  };
  const buyNow = () => { add(); navigate('/cart'); };           // Agrega y va directo al checkout

  return (
    <div>
      <Link to="/products" className="back-link">← Volver al catálogo</Link>
      <div className="card detail">
        <div className="img-box">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} className="product-img" />
            : <div className="product-emoji">{product.emoji}</div>}
        </div>

        <div className="detail-info">
          <p className="muted small">{product.category}</p>
          <h2 className="detail-title">{product.name}</h2>
          <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
          <p className={stock > 0 ? 'stock-ok' : 'stock-out'}>
            {stock > 0 ? `Stock: ${stock} disponibles` : 'Sin stock'}
          </p>

          {stock > 0 && (                                       // Solo se puede comprar si hay stock
            <>
              <div className="qty-row">
                <div className="qty-box">
                  <button className="icon-btn" onClick={() => setQty(Math.max(1, qty - 1))}>➖</button>
                  <span>{qty}</span>
                  {/* Math.min impide elegir más unidades que el stock */}
                  <button className="icon-btn" onClick={() => setQty(Math.min(stock, qty + 1))}>➕</button>
                </div>
                <button className="primary-btn" onClick={addToCart}>Agregar al carrito</button>
                <button className="secondary-btn" onClick={buyNow}>Comprar ahora</button>
              </div>
              {added && <p className="added-msg">¡Agregado al carrito!</p>}
            </>
          )}

          {product.description && <p>{product.description}</p>}

          {product.features && product.features.length > 0 && (
            <>
              <h3 className="bold">Características</h3>
              <ul className="features">
                {product.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}