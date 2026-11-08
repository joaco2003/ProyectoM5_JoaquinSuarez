import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../services/orderService';
import type { Product, Order, OrderStatus } from '../types';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
// features es un texto (una característica por línea); al guardar lo convertimos en lista
const EMPTY = { name: '', price: '', category: '', emoji: '🎾', imageUrl: '', description: '', features: '', stock: '' };

export default function Admin() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null); // NUEVO: ID del producto que se edita (null = creando)

  async function reload() {
    const [p, o] = await Promise.all([getProducts(), getAllOrders()]);
    setProducts(p);
    setOrders(o);
  }
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);



  // NUEVO: carga un producto en el formulario para editarlo
  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, price: String(p.price), category: p.category, emoji: p.emoji,
      imageUrl: p.imageUrl ?? '', description: p.description ?? '',
      features: (p.features ?? []).join('\n'),         // La lista pasa a texto, una por línea
      stock: String(p.stock ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });   // Sube para ver el formulario
  }

  function cancelEdit() { setEditingId(null); setForm(EMPTY); }

  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name, price: Number(form.price), category: form.category,
      emoji: form.emoji, imageUrl: form.imageUrl.trim(), description: form.description.trim(),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean), // Texto -> lista, sin líneas vacías
      stock: Number(form.stock),
    };
    if (editingId) await updateProduct(editingId, data); // Si estamos editando, actualiza
    else await createProduct(data);                      // Si no, crea uno nuevo
    cancelEdit();                                        // Limpia el formulario y sale del modo edición
    reload();
  }

  return (
    <div className="stack stack-lg">
      <section className="card">
        <h2 className="title">{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
        <form onSubmit={saveProduct} className="admin-form">
          <input className="field" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="field" type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="field" type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          <input className="field" placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="field" placeholder="Emoji (si no hay foto)" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} required />
          <input className="field field-wide" placeholder="Link de la imagen (opcional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <textarea className="field field-wide" rows={2} placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea className="field field-wide" rows={4} placeholder={'Características (una por línea)\nEj: Forma: Diamante\nEj: Peso: 365 g'} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          <button className="primary-btn">{editingId ? 'Guardar cambios' : 'Agregar'}</button>
          {editingId && <button type="button" className="link-btn" onClick={cancelEdit}>Cancelar edición</button>}
        </form>
      </section>

      <section className="card">
        <h2 className="title">Productos</h2>
        {products.map((p) => (
          <div key={p.id} className="row">
            <span className="row-info">
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} className="thumb" />
                : <span className="thumb-emoji">{p.emoji}</span>}
              {p.name} · ${p.price.toLocaleString('es-AR')} · {p.category} · stock {p.stock ?? 0}
            </span>
            <span>
              <button className="icon-btn" onClick={() => startEdit(p)} aria-label="Editar">✏️</button>
              <button className="icon-btn" onClick={async () => { await deleteProduct(p.id); reload(); }} aria-label="Borrar">🗑️</button>
            </span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="title">Órdenes</h2>
        {orders.length === 0 && <p>No hay órdenes todavía.</p>}
        {orders.map((o) => (
          <div key={o.id} className="row">
            <div>
              <p className="muted small">{new Date(o.createdAt).toLocaleString('es-AR')} · {o.userId}</p>
              <p>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')} — <b>${o.total.toLocaleString('es-AR')}</b></p>
            </div>
            <span>
              <select className="field" value={o.status}
                onChange={async (e) => { await updateOrderStatus(o.id, e.target.value as OrderStatus); reload(); }}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* NUEVO: borrar orden, con confirmación para no borrar sin querer */}
              <button className="icon-btn" aria-label="Borrar orden"
                onClick={async () => { if (window.confirm('¿Borrar esta orden?')) { await deleteOrder(o.id); reload(); } }}>🗑️</button>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}