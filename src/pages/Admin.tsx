import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'; // NUEVO: ChangeEvent
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../services/orderService';
import { uploadImage } from '../services/imageService'; // NUEVO: sube la foto a S3
import type { Product, Order, OrderStatus } from '../types';
import ProductImage from '../components/ProductImage';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
// NUEVO: imageKey guarda el nombre de la foto en S3
const EMPTY = { name: '', price: '', category: '', emoji: '🎾', imageUrl: '', imageKey: '', description: '', features: '', stock: '' };

export default function Admin() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);   // NUEVO: true mientras se sube la foto
  const [uploadError, setUploadError] = useState('');  // NUEVO: mensaje si falla la subida

  async function reload() {
    const [p, o] = await Promise.all([getProducts(), getAllOrders()]);
    setProducts(p);
    setOrders(o);
  }
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, price: String(p.price), category: p.category, emoji: p.emoji,
      imageUrl: p.imageUrl ?? '',
      imageKey: p.imageKey ?? '',                       // NUEVO
      description: p.description ?? '',
      features: (p.features ?? []).join('\n'),
      stock: String(p.stock ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditingId(null); setForm(EMPTY); setUploadError(''); }

  // NUEVO: se ejecuta cuando elegís un archivo
  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';                                // Permite volver a elegir el mismo archivo
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError('La imagen pesa más de 2 MB'); return; } // Límite de tamaño
    setUploading(true);
    setUploadError('');
    try {
      const key = await uploadImage(file);              // Sube a S3 y devuelve el nombre guardado
      setForm((f) => ({ ...f, imageKey: key }));        // Lo guardamos en el formulario
    } catch { setUploadError('No se pudo subir la imagen'); }
    finally { setUploading(false); }
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name, price: Number(form.price), category: form.category,
      emoji: form.emoji, imageUrl: form.imageUrl.trim(),
      imageKey: form.imageKey,                          // NUEVO: se guarda la foto de S3
      description: form.description.trim(),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      stock: Number(form.stock),
    };
    if (editingId) await updateProduct(editingId, data);
    else await createProduct(data);
    cancelEdit();
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

          {/* NUEVO: reemplaza al campo "Link de la imagen". Elegís un archivo de tu computadora */}
          <div className="field-wide upload-box">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
            {uploading && <p className="muted small">Subiendo...</p>}
            {uploadError && <p className="error-msg">{uploadError}</p>}
            {/* Vista previa: si hay foto de S3, o si el producto tiene el link viejo */}
            {(form.imageKey || form.imageUrl) && (
              <>
                <ProductImage imageKey={form.imageKey} imageUrl={form.imageUrl} emoji={form.emoji} alt="Vista previa" imgClass="upload-preview" emojiClass="thumb-emoji" />
                <button type="button" className="link-btn" onClick={() => setForm({ ...form, imageKey: '', imageUrl: '' })}>Quitar foto</button>
              </>
            )}
          </div>

          <textarea className="field field-wide" rows={2} placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea className="field field-wide" rows={4} placeholder={'Características (una por línea)\nEj: Forma: Diamante\nEj: Peso: 365 g'} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />

          {/* NUEVO: disabled={uploading} evita guardar mientras la foto todavía se está subiendo */}
          <button className="primary-btn" disabled={uploading}>{editingId ? 'Guardar cambios' : 'Agregar'}</button>
          {editingId && <button type="button" className="link-btn" onClick={cancelEdit}>Cancelar edición</button>}
        </form>
      </section>

      <section className="card">
        <h2 className="title">Productos</h2>
        {products.map((p) => (
          <div key={p.id} className="row">
            <span className="row-info">
              {/* NUEVO: ProductImage muestra la foto de S3, la de link o el emoji */}
              <ProductImage imageKey={p.imageKey} imageUrl={p.imageUrl} emoji={p.emoji} alt={p.name} imgClass="thumb" emojiClass="thumb-emoji" />
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
              <button className="icon-btn" aria-label="Borrar orden"
                onClick={async () => { if (window.confirm('¿Borrar esta orden?')) { await deleteOrder(o.id); reload(); } }}>🗑️</button>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}