import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrder } from '../services/orderService'
import { STATUS_LABEL, STEPS, stepIndex } from '../utils/orderStatus'
import ProductImage from '../components/ProductImage'
import type { Order } from '../types'

export default function OrderDetail() {
  const { id } = useParams()                                  // Lee el ":id" de /orders/:id
  const { user, isAdmin } = useAuth()
  // undefined = cargando, null = no existe o no tenés permiso, Order = encontrada
  const [order, setOrder] = useState<Order | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    getOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))   // Si Firestore rechaza el permiso, lo tratamos como "no encontrada"
  }, [id])

  if (order === undefined) return <p>Cargando...</p>

  // Una orden ajena también se muestra como "no encontrada" (salvo que seas admin)
  if (order === null || (order.userId !== user?.uid && !isAdmin))
    return <p>Orden no encontrada. <Link to="/orders">Volver a mis órdenes</Link></p>

  const current = stepIndex(order.status)                     // 0, 1, 2 o -1 si está cancelada
  const cancelled = order.status === 'cancelled'

  return (
    <div className="stack">
      <Link to="/orders" className="back-link">← Volver a mis órdenes</Link>

      <div className="card stack">
        <div className="order-head">
          <div>
            <h2 className="title">Detalle de la orden</h2>
            <p className="muted small">N° {order.id}</p>
            <p className="muted small">{new Date(order.createdAt).toLocaleString('es-AR')}</p>
          </div>
          <span className={`badge badge-${order.status}`}>{STATUS_LABEL[order.status]}</span>
        </div>

        {/* Seguimiento: una línea de pasos. Si la orden se canceló, se muestra un aviso en su lugar */}
        {cancelled ? (
          <p className="error-msg">Esta orden fue cancelada.</p>
        ) : (
          <ol className="timeline">
            {STEPS.map((s, i) => (
              <li key={s} className={i <= current ? 'step step-done' : 'step'}>
                <span className="step-dot">{i < current ? '✓' : i + 1}</span>
                <span className="step-label">{STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card">
        <h3 className="bold">Productos</h3>
        {order.items.map((i) => (
          <div key={i.productId} className="row">
            <div className="row-info">
              <ProductImage imageKey={i.imageKey} imageUrl={i.imageUrl} emoji={i.emoji} alt={i.name} imgClass="thumb-sm" emojiClass="thumb-sm thumb-emoji" />
              <div>
                <p className="bold">{i.name}</p>
                <p className="muted small">{i.quantity} × ${i.price.toLocaleString('es-AR')}</p>
              </div>
            </div>
            <p className="bold">${(i.quantity * i.price).toLocaleString('es-AR')}</p>
          </div>
        ))}
        <p className="total">Total: ${order.total.toLocaleString('es-AR')}</p>
      </div>
    </div>
  )
}