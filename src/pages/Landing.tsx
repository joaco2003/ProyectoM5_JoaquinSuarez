import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function Landing() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getProducts().then(setProducts); }, []);   // Trae los productos al abrir la página

  const featured = products.slice(0, 4);                        // Los primeros 4 son los "destacados"

  return (
    <div className="stack stack-lg">
      <section className="card hero">
        <h1 className="hero-title">Todo para tu juego de pádel</h1>
        <p className="hero-text">Palas, paleteros, calzado y accesorios de las mejores marcas.</p>
        <Link to="/products" className="primary-btn hero-btn">Ver productos</Link>
      </section>

      {featured.length > 0 && (
        <section>
          <h2 className="title">Productos destacados</h2>
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}