import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Logo de Google: cuatro trazos. Colores y tamaño se definen en index.css
const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 48 48">
    <path className="g-red" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path className="g-blue" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path className="g-yellow" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path className="g-green" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false); // false = login, true = registro
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();                                // Evita que la página se recargue
    try {
      await (isRegister ? register : login)(email, password);
      navigate('/');
    } catch { setError('No se pudo completar. Revisá email y contraseña (mín. 6 caracteres).'); }
  }

  async function google() {
    try {
      await loginWithGoogle();                         // Abre la ventanita de Google
      navigate('/');
    } catch { setError('No se pudo ingresar con Google.'); }
  }

  return (
    <form onSubmit={submit} className="login-card">
      <h2 className="login-title">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="field" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="error-msg">{error}</p>}
      <button className="primary-btn">{isRegister ? 'Registrarme' : 'Entrar'}</button>

      <div className="login-divider"><span>o</span></div>

      <button type="button" className="google-btn" onClick={google}>
        <GoogleIcon /> Continuar con Google
      </button>

      <button type="button" className="link-btn" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Ya tengo cuenta' : 'No tengo cuenta'}
      </button>
    </form>
  );
}
