import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '1.2rem',
        color: '#6c757d'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere ser admin y no lo es
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h2 style={{ color: '#856404', marginBottom: '1rem' }}>
            ⚠️ Acceso Restringido
          </h2>
          <p style={{ color: '#856404', margin: 0 }}>
            Esta página está reservada para administradores. 
            <br />
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;