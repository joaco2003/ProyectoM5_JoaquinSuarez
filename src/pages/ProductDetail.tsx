import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toCartItem } from '../utils/toCartItem';
import ProductImage from '../components/ProductImage';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined = cargando
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { if (id) getProduct(id).then(setProduct); }, [id]);

  if (product === undefined) return <p>Cargando...</p>;
  if (product === null) return <p>Producto no encontrado. <Link to="/products">Volver</Link></p>;

  const stock = product.stock ?? 0;
  const extras = product.extraImageKeys ?? [];                      // Fotos adicionales (lista vacía si no hay)
  const hasMain = Boolean(product.imageKey || product.imageUrl);    // ¿Tiene foto principal?
  const showMain = hasMain || extras.length === 0;                  // Si no hay ninguna foto, igual mostramos el recuadro con el emoji
  const imageCount = (showMain ? 1 : 0) + extras.length;            // Cantidad total de recuadros

  const add = () => { for (let i = 0; i < qty; i++) dispatch({ type: 'ADD', item: toCartItem(product) }); };
  const addToCart = () => { add(); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  const buyNow = () => { add(); navigate('/cart'); };

  return (
    <div>
      <Link to="/products" className="back-link">← Volver al catálogo</Link>

      <div className="pd">
        {/* Galería: si hay una sola imagen ocupa todo el ancho; si hay más, van de a dos */}
        <div className={imageCount > 1 ? 'gallery' : 'gallery gallery-single'}>
          {showMain && (
            <div className="gallery-item">
              <ProductImage imageKey={product.imageKey} imageUrl={product.imageUrl} emoji={product.emoji} alt={product.name} imgClass="gallery-img" emojiClass="product-emoji" />
            </div>
          )}
          {extras.map((k) => (
            <div key={k} className="gallery-item">
              <ProductImage imageKey={k} emoji={product.emoji} alt={product.name} imgClass="gallery-img" emojiClass="product-emoji" />
            </div>
          ))}
        </div>

        <div className="card pd-info">
          <p className="muted small">{product.category}</p>
          <h2 className="detail-title">{product.name}</h2>
          <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
          <p className={stock > 0 ? 'stock-ok' : 'stock-out'}>
            {stock > 0 ? `Stock: ${stock} disponibles` : 'Sin stock'}
          </p>

          {stock > 0 && (
            <>
              <div className="qty-row">
                <div className="qty-box">
                  <button className="icon-btn" onClick={() => setQty(Math.max(1, qty - 1))}>➖</button>
                  <span>{qty}</span>
                  <button className="icon-btn" onClick={() => setQty(Math.min(stock, qty + 1))}>➕</button>
                </div>
                <button className="primary-btn" onClick={addToCart}>Agregar al carrito</button>
                <button className="secondary-btn" onClick={buyNow}>Comprar ahora</button>
              </div>
              {added && <p className="added-msg">¡Agregado al carrito!</p>}
            </>
          )}

          {/* Secciones desplegables. <details> se abre y se cierra solo al tocar el <summary> */}
          <div className="accordions">
            {product.description && (
              <details className="accordion">
                <summary>Descripción</summary>
                <p>{product.description}</p>
              </details>
            )}

            {product.features && product.features.length > 0 && (
              <details className="accordion">
                <summary>Características</summary>
                <ul className="features">
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </details>
            )}

            <details className="accordion">
              <summary>Envíos y devoluciones</summary>
              {/* Texto de ejemplo: cambialo por las condiciones reales de tu tienda */}
              <p>Realizamos envíos a todo el país. Tenés 30 días para cambiar o devolver tu compra.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}