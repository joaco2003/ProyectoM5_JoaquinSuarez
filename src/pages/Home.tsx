import { useEffect, useState } from 'react';
import { getProducts, seedProducts } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('none');
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
      <div className="filters">
        <input className="field filters-search" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="none">Ordenar por</option>
          <option value="asc">Precio: menor a mayor</option>
          <option value="desc">Precio: mayor a menor</option>
        </select>
      </div>

      <div className="chips">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={c === category ? 'chip chip-active' : 'chip'}>{c}</button>
        ))}
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