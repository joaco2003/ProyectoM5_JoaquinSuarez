import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../services/orderService';
import { uploadImage } from '../services/imageService';
import type { Product, Order, OrderStatus } from '../types';
import ProductImage from '../components/ProductImage';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
const EMPTY = {
  name: '', price: '', category: '', emoji: '🎾', imageUrl: '', imageKey: '',
  extraImageKeys: [] as string[],                      // Lista de fotos adicionales (nombres en S3)
  description: '', features: '', stock: '',
};

export default function Admin() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
      imageUrl: p.imageUrl ?? '', imageKey: p.imageKey ?? '',
      extraImageKeys: p.extraImageKeys ?? [],
      description: p.description ?? '', features: (p.features ?? []).join('\n'),
      stock: String(p.stock ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditingId(null); setForm(EMPTY); setUploadError(''); }

  // Sube el archivo elegido y devuelve su "key" (o null si algo falla). Lo usan las dos zonas de subida
  async function pickImage(e: ChangeEvent<HTMLInputElement>): Promise<string | null> {
    const file = e.target.files?.[0];
    e.target.value = '';                                 // Permite volver a elegir el mismo archivo
    if (!file) return null;
    if (file.size > 2 * 1024 * 1024) { setUploadError('La imagen pesa más de 2 MB'); return null; }
    setUploading(true);
    setUploadError('');
    try { return await uploadImage(file); }
    catch (err) { setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen'); return null; }
    finally { setUploading(false); }
  }

  async function onMainFile(e: ChangeEvent<HTMLInputElement>) {
    const key = await pickImage(e);
    if (key) setForm((f) => ({ ...f, imageKey: key }));
  }

  async function onExtraFile(e: ChangeEvent<HTMLInputElement>) {
    const key = await pickImage(e);
    if (key) setForm((f) => ({ ...f, extraImageKeys: [...f.extraImageKeys, key] })); // Suma la nueva al final
  }

  function removeExtra(key: string) {
    setForm((f) => ({ ...f, extraImageKeys: f.extraImageKeys.filter((k) => k !== key) }));
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name, price: Number(form.price), category: form.category,
      emoji: form.emoji, imageUrl: form.imageUrl.trim(), imageKey: form.imageKey,
      extraImageKeys: form.extraImageKeys,
      description: form.description.trim(),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      stock: Number(form.stock),
    };
    if (editingId) await updateProduct(editingId, data);
    else await createProduct(data);
    cancelEdit();
    reload();
  }

  const hasMain = Boolean(form.imageKey || form.imageUrl);

  return (
    <div className="stack stack-lg">
      <section className="card">
        <h2 className="title">{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
        <form onSubmit={saveProduct} className="admin-form">
          <label className="form-group col-3">
            <span>Nombre</span>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="form-group col-3">
            <span>Categoría</span>
            <input className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </label>
          <label className="form-group col-2">
            <span>Precio</span>
            <input className="field" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
          <label className="form-group col-2">
            <span>Stock</span>
            <input className="field" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          </label>
          <label className="form-group col-2">
            <span>Emoji (si no hay foto)</span>
            <input className="field" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} required />
          </label>

          {/* Imágenes: la principal a la izquierda, las adicionales a la derecha */}
          <div className="upload-section col-6">
            <div className="upload-block">
              <span className="bold small">Imagen principal</span>
              <label className="file-btn">
                📷 {hasMain ? 'Cambiar imagen' : 'Elegir imagen'}
                <input type="file" className="file-hidden" accept="image/jpeg,image/png,image/webp" onChange={onMainFile} />
              </label>
              {hasMain && (
                <div className="upload-thumb">
                  <ProductImage imageKey={form.imageKey} imageUrl={form.imageUrl} emoji={form.emoji} alt="Imagen principal" imgClass="upload-preview" emojiClass="upload-preview" />
                  <button type="button" className="thumb-remove" aria-label="Quitar imagen principal"
                    onClick={() => setForm({ ...form, imageKey: '', imageUrl: '' })}>✕</button>
                </div>
              )}
            </div>

            <div className="upload-block">
              <span className="bold small">Imágenes adicionales</span>
              <label className="file-btn">
                ➕ Agregar otra imagen
                <input type="file" className="file-hidden" accept="image/jpeg,image/png,image/webp" onChange={onExtraFile} />
              </label>
              <div className="upload-thumbs">
                {form.extraImageKeys.map((k) => (
                  <div key={k} className="upload-thumb">
                    <ProductImage imageKey={k} emoji={form.emoji} alt="Imagen adicional" imgClass="upload-preview" emojiClass="upload-preview" />
                    <button type="button" className="thumb-remove" aria-label="Quitar imagen" onClick={() => removeExtra(k)}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {uploading && <p className="muted small col-6">Subiendo imagen...</p>}
            {uploadError && <p className="error-msg col-6">{uploadError}</p>}
          </div>

          <label className="form-group col-3">
            <span>Descripción</span>
            <textarea className="field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="form-group col-3">
            <span>Características (una por línea)</span>
            <textarea className="field" placeholder={'Forma: Diamante\nPeso: 365 g'} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </label>

          <div className="form-actions col-6">
            <button className="primary-btn" disabled={uploading}>{editingId ? 'Guardar cambios' : 'Agregar producto'}</button>
            {editingId && <button type="button" className="danger-btn" onClick={cancelEdit}>Cancelar edición</button>}
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="title">Productos ({products.length})</h2>
        {products.map((p) => (
          <div key={p.id} className="row">
            <span className="row-info">
              <ProductImage imageKey={p.imageKey} imageUrl={p.imageUrl} emoji={p.emoji} alt={p.name} imgClass="thumb" emojiClass="thumb-emoji" />
              <span>
                <span className="bold">{p.name}</span>
                <span className="muted small row-meta">${p.price.toLocaleString('es-AR')} · {p.category} · stock {p.stock ?? 0}</span>
              </span>
            </span>
            <span className="row-actions">
              <button className="icon-btn" onClick={() => startEdit(p)} aria-label="Editar">✏️</button>
              <button className="icon-btn" onClick={async () => { if (window.confirm('¿Borrar este producto?')) { await deleteProduct(p.id); reload(); } }} aria-label="Borrar">🗑️</button>
            </span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="title">Órdenes ({orders.length})</h2>
        {orders.length === 0 && <p>No hay órdenes todavía.</p>}
        {orders.map((o) => (
          <div key={o.id} className="row">
            <div>
              <p className="muted small">{new Date(o.createdAt).toLocaleString('es-AR')} · {o.userId}</p>
              <p>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')} — <b>${o.total.toLocaleString('es-AR')}</b></p>
            </div>
            <span className="row-actions">
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