import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getAllOrders, getUserOrders, updateOrderStatus, deleteOrder } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

// Estado: la lista de órdenes, si está cargando y si hubo error
interface OrdersState { orders: Order[]; loading: boolean; error: string | null; }

// Todo lo que puede pasar con las órdenes
type OrdersAction =
  | { type: 'FETCH_START' }                                   // Empezamos a pedirlas
  | { type: 'FETCH_SUCCESS'; orders: Order[] }                // Llegaron bien
  | { type: 'FETCH_ERROR'; error: string }                    // Falló la carga
  | { type: 'UPDATE_STATUS'; id: string; status: OrderStatus } // Cambió el estado de una orden
  | { type: 'REMOVE'; id: string }                            // Se borró una orden
  | { type: 'RESET' };                                        // Se cerró sesión: vaciamos todo

const initialState: OrdersState = { orders: [], loading: false, error: null };

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS': return { orders: action.orders, loading: false, error: null };
    case 'FETCH_ERROR': return { ...state, loading: false, error: action.error };
    case 'UPDATE_STATUS': // Copiamos la lista cambiando solo la orden indicada
      return { ...state, orders: state.orders.map((o) => o.id === action.id ? { ...o, status: action.status } : o) };
    case 'REMOVE': // Dejamos todas menos la borrada
      return { ...state, orders: state.orders.filter((o) => o.id !== action.id) };
    case 'RESET': return initialState;
  }
}

interface OrdersValue extends OrdersState {
  refresh: () => Promise<void>;                                   // Vuelve a pedir las órdenes
  changeStatus: (id: string, status: OrderStatus) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
}
const OrdersContext = createContext<OrdersValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();                            // Necesitamos saber quién es y si es admin
  const [state, dispatch] = useReducer(ordersReducer, initialState);
  const uid = user?.uid;

  // useCallback evita que "refresh" se recree en cada render (así el useEffect de abajo no se repite sin parar)
  const refresh = useCallback(async () => {
    if (!uid) { dispatch({ type: 'RESET' }); return; }            // Sin sesión: nada que cargar
    dispatch({ type: 'FETCH_START' });
    try {
      // El admin trae todas las órdenes; el cliente, solo las suyas
      const orders = isAdmin ? await getAllOrders() : await getUserOrders(uid);
      dispatch({ type: 'FETCH_SUCCESS', orders });
    } catch { dispatch({ type: 'FETCH_ERROR', error: 'No se pudieron cargar las órdenes' }); }
  }, [uid, isAdmin]);

  useEffect(() => { refresh(); }, [refresh]);                     // Carga al iniciar sesión y cada vez que cambia el usuario

  const value: OrdersValue = {
    ...state,
    refresh,
    changeStatus: async (id, status) => {
      await updateOrderStatus(id, status);                        // Primero Firestore...
      dispatch({ type: 'UPDATE_STATUS', id, status });            // ...y si salió bien, actualizamos la pantalla
    },
    removeOrder: async (id) => {
      await deleteOrder(id);
      dispatch({ type: 'REMOVE', id });
    },
  };
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders debe usarse dentro de OrdersProvider');
  return ctx;
}