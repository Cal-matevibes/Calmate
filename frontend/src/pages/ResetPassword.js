import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import './styles/Login.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Error al restablecer la contraseña. Intentá de nuevo.');
      }
    } catch (err) {
      setError('Error de conexión. Verificá tu internet e intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-card">
        {success ? (
          <div className="forgot-success" style={{ padding: '2.5rem 2rem' }}>
            <div className="success-icon">✓</div>
            <h2>¡Contraseña actualizada!</h2>
            <p>Tu contraseña fue restablecida exitosamente. Ya podés iniciar sesión con tu nueva contraseña.</p>
            <button className="submit-btn" onClick={() => navigate('/login')}>
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Nueva contraseña</h2>
            <p className="forgot-subtitle">Ingresá tu nueva contraseña para recuperar el acceso a tu cuenta.</p>

            <div className="form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repetí tu nueva contraseña"
              />
            </div>

            {error && (
              <div className="error-message-login" style={{ margin: '0 0 1rem 0' }}>
                {error}
                {(error.includes('inválido') || error.includes('expiró')) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#721c24', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                      onClick={() => navigate('/login')}
                    >
                      Solicitá un nuevo link
                    </button>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
