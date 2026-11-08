import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guardia de rutas. adminOnly = true además exige el rol admin
export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;                          // Firebase todavía está revisando la sesión
  if (!user) return <Navigate to="/login" replace />;             // Sin sesión: a Login
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;  // Sin permisos de admin: al inicio
  return <Outlet />;                                               // Todo bien: muestra la página hija
}