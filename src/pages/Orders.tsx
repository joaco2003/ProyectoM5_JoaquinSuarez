import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';

export default function Orders() {
  const { user } = useAuth();                      // Ya no hace falta "loading": el guardia ProtectedRoute lo maneja
  const { orders, loading, error } = useOrders();

  // Si sos admin, el contexto trae TODAS las órdenes; acá mostramos solo las tuyas.
  // "user?.uid" significa: si user es null, devuelve undefined en vez de romper
  const mine = orders.filter((o) => o.userId === user?.uid);

  return (
    <div className="stack">
      <h2 className="title">Mis órdenes</h2>
      {loading && <p>Cargando órdenes...</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && mine.length === 0 && <p>Todavía no compraste nada.</p>}
      {mine.map((o) => (
        <div key={o.id} className="card">
          <p className="muted small">{new Date(o.createdAt).toLocaleString('es-AR')} · Estado: {o.status}</p>
          {o.items.map((i) => <p key={i.productId}>{i.quantity} × {i.name}</p>)}
          <p className="bold">Total: ${o.total.toLocaleString('es-AR')}</p>
        </div>
      ))}
    </div>
  );
}