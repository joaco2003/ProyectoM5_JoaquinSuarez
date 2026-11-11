import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { STATUS_LABEL } from '../utils/orderStatus'

export default function Orders() {
  const { user } = useAuth()
  const { orders, loading, error } = useOrders()

  // Si sos admin, el contexto trae TODAS las órdenes; acá mostramos solo las tuyas
  const mine = orders.filter((o) => o.userId === user?.uid)

  return (
    <div className="stack">
      <h2 className="title">Mis órdenes</h2>
      {loading && <p>Cargando órdenes...</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && mine.length === 0 && <p>Todavía no compraste nada. <Link to="/products">Ver productos</Link></p>}

      {mine.map((o) => (
        // Toda la tarjeta es un link al detalle
        <Link key={o.id} to={`/orders/${o.id}`} className="card order-link">
          <div className="order-head">
            <p className="muted small">{new Date(o.createdAt).toLocaleString('es-AR')}</p>
            <span className={`badge badge-${o.status}`}>{STATUS_LABEL[o.status]}</span>
          </div>
          {/* Resumen: los primeros productos y cuántos más hay */}
          <p>
            {o.items.slice(0, 2).map((i) => `${i.quantity}× ${i.name}`).join(', ')}
            {o.items.length > 2 && ` y ${o.items.length - 2} más`}
          </p>
          <p className="bold">Total: ${o.total.toLocaleString('es-AR')}</p>
          <p className="small order-more">Ver detalle →</p>
        </Link>
      ))}
    </div>
  )
}