import { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { useTheme } from './context/ThemeContext';
import Footer from './components/Footer';
// Icono de persona
const UserIcon = () => (
  <svg className="icon" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

// Icono de bolsa
const BagIcon = () => (
  <svg className="icon" viewBox="0 0 24 24">
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

// NavLink nos dice si el link coincide con la página actual (isActive), para resaltarlo
const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link nav-link-active' : 'nav-link');

export default function App() {
  const { user, isAdmin, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="navbar-logo">🎾 Pádel Shop</Link>

        {/* Links de navegación. "end" en Inicio evita que quede marcado en todas las páginas */}
        <div className="nav-links">
          <NavLink to="/" end className={linkClass}>Inicio</NavLink>
          <NavLink to="/products" className={linkClass}>Productos</NavLink>
        </div>

        <div className="navbar-actions">
          <button className="icon-btn" onClick={toggle} aria-label="Cambiar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div className="account">
            {user ? (
              <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mi cuenta">
                <UserIcon />
              </button>
            ) : (
              <Link className="icon-btn" to="/login" aria-label="Ingresar">
                <UserIcon />
              </Link>
            )}

            {user && menuOpen && (
              <div className="account-menu" onClick={() => setMenuOpen(false)}>
                <p className="account-email">{user.email}</p>
                <Link className="account-link" to="/orders">Mis órdenes</Link>
                {isAdmin && <Link className="account-link" to="/admin">Admin</Link>}
                <button className="account-link" onClick={logout}>Salir</button>
              </div>
            )}
          </div>

          <Link to="/cart" className="cart-link" aria-label="Carrito">
            <BagIcon />
            <span className="cart-badge">{count}</span>
          </Link>
        </div>
      </nav>

      <main className="page">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas que exigen sesión: todo lo que está adentro pasa por el guardia */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Rutas que exigen sesión y rol admin */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Cualquier dirección que no exista vuelve al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}