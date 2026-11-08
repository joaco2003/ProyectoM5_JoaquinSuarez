import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3 className="bold">🎾 Pádel Shop</h3>
          <p className="small">Todo para tu juego de pádel.</p>
        </div>
        <div className="footer-col">
          <h3 className="bold">Navegación</h3>
          <Link to="/">Inicio</Link>
          <Link to="/products">Productos</Link>
        </div>
        <div className="footer-col">
          <h3 className="bold">Contacto</h3>
          <p>📧 contacto@padelshop.com</p>
          <p>📱 +54 261 000 0000</p>
          <p>🕒 Lunes a sábado, de 9 a 19 hs</p>
        </div>
      </div>
      {/* getFullYear() pone el año actual solo, sin que tengas que actualizarlo */}
      <p className="footer-copy">© {new Date().getFullYear()} Pádel Shop. Todos los derechos reservados.</p>
    </footer>
  );
}