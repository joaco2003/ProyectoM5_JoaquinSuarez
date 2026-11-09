import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, seedProducts } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState('none');

  const [params, setParams] = useSearchParams();
  const category = params.get('cat') ?? 'Todas';
  const setCategory = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === 'Todas') next.delete('cat'); else next.set('cat', c);
    setParams(next);
  };

  const search = params.get('q') ?? '';
  const debouncedSearch = useDebounce(search);
  useEffect(() => { getProducts().then(setProducts); }, []);

  const categories = ['Todas', ...new Set(products.map((p) => p.category))];

  const visible = products
    .filter((p) => category === 'Todas' || p.category === category)
    .filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase().trim()));

  if (sort === 'asc') visible.sort((a, b) => a.price - b.price);
  if (sort === 'desc') visible.sort((a, b) => b.price - a.price);

  return (
    <div>
      <div className="filter-bar">
        <div className="chips">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={c === category ? 'chip chip-active' : 'chip'}>{c}</button>
          ))}
        </div>

        <div className="filter-right">
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="none">Ordenar por</option>
            <option value="asc">Precio: menor a mayor</option>
            <option value="desc">Precio: mayor a menor</option>
          </select>
          <span className="filter-count">{visible.length} productos</span>
        </div>
      </div>

      {products.length === 0 && (
        <button className="primary-btn" onClick={() => seedProducts().then(getProducts).then(setProducts)}>
          Cargar productos de ejemplo
        </button>
      )}
      {products.length > 0 && visible.length === 0 && <p>No se encontraron productos.</p>}

      <div className="product-grid">
        {visible.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}