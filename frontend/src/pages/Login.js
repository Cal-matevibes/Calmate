import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/Login.css';
import Header from '../components/layout/Header';
import Loading from '../components/shared/Loading';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login, register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Limpiar errores al cambiar de vista
  useEffect(() => {
    clearError();
    setForgotError('');
  }, [currentView, clearError]);

  const handleLoginChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/solicitar-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotSuccess(true);
      } else {
        setForgotError(data.message || 'Error al enviar el email. Intentá de nuevo.');
      }
    } catch (err) {
      setForgotError('Error de conexión. Verificá tu internet e intentá de nuevo.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
    // El error ya se maneja en AuthContext y se muestra automáticamente
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validaciones del frontend
    if (registerData.password !== registerData.confirmPassword) {
      // Podríamos usar el sistema de errores del AuthContext aquí también
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!registerData.nombre || !registerData.apellido || !registerData.email || !registerData.password) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (registerData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const { confirmPassword, ...dataToSend } = registerData;
    const result = await register(dataToSend);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
    // El error ya se maneja en AuthContext y se muestra automáticamente
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <Header />
      <div className="login-card">
        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`tab ${currentView === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentView('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`tab ${currentView === 'register' ? 'active' : ''}`}
            onClick={() => setCurrentView('register')}
          >
            Registrarse
          </button>
        </div>

        {currentView === 'login' && (
          // Formulario de Login
          <form onSubmit={handleLoginSubmit} className="login-form">
            <h2>Iniciar Sesión</h2>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleLoginChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleLoginChange}
                required
                placeholder="Tu contraseña"
              />
            </div>

            <div className="forgot-password-link">
              <button type="button" onClick={() => setCurrentView('forgot')}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {currentView === 'register' && (
          // Formulario de Registro
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={registerData.nombre}
                  onChange={handleRegisterChange}
                  required
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={registerData.apellido}
                  onChange={handleRegisterChange}
                  required
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">Contraseña</label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        {currentView === 'forgot' && (
          <div className="login-form">
            {forgotSuccess ? (
              <div className="forgot-success">
                <div className="success-icon">✓</div>
                <h2>Email enviado</h2>
                <p>Si existe una cuenta con <strong>{forgotEmail}</strong>, recibirás las instrucciones en breve. Revisá también la carpeta spam.</p>
                <button
                  className="submit-btn"
                  onClick={() => { setCurrentView('login'); setForgotSuccess(false); setForgotEmail(''); }}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <button type="button" className="back-btn" onClick={() => setCurrentView('login')}>
                  ← Volver
                </button>
                <h2>Recuperar contraseña</h2>
                <p className="forgot-subtitle">Ingresá tu email y te enviaremos las instrucciones para restablecer tu contraseña.</p>
                <div className="form-group">
                  <label htmlFor="forgotEmail">Email</label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
                {forgotError && <div className="error-message-login">{forgotError}</div>}
                <button type="submit" className="submit-btn" disabled={forgotLoading}>
                  {forgotLoading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </form>
            )}
          </div>
        )}

        {error && (
          <div className="error-message-login">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;