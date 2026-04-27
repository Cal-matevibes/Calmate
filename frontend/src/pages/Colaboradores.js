import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import Loading from '../components/shared/Loading';
import './styles/Colaboradores.css';

function Colaboradores() {
  const { token, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [loadingRol, setLoadingRol] = useState(null); // id del usuario en proceso
  const [toast, setToast] = useState(null); // { tipo: 'ok'|'error', mensaje }

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.obtenerUsuarios(token, { buscar, rol: filtroRol });
      setUsuarios(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, buscar, filtroRol]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsuarios();
  }, [isAdmin, navigate, fetchUsuarios]);

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCambiarRol = async (usuario) => {
    const nuevoRol = usuario.rol === 'admin' ? 'cliente' : 'admin';
    setLoadingRol(usuario._id);
    try {
      await usuarioService.cambiarRol(token, usuario._id, nuevoRol);
      setUsuarios(prev =>
        prev.map(u => u._id === usuario._id ? { ...u, rol: nuevoRol } : u)
      );
      mostrarToast('ok', `${usuario.nombre} ahora es ${nuevoRol === 'admin' ? 'Administrador' : 'Cliente'}`);
    } catch (err) {
      mostrarToast('error', err.message);
    } finally {
      setLoadingRol(null);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => u._id !== user?._id);

  return (
    <div className="colaboradores-page">
      <Header />
      <main className="colaboradores-main">
        <div className="colaboradores-container">

          {/* Encabezado */}
          <div className="colaboradores-header">
            <div className="colaboradores-title-group">
              <h1 className="colaboradores-title">
                <i className="bi bi-people-fill"></i> Gestión de Colaboradores
              </h1>
              <p className="colaboradores-subtitle">
                Asigná o quitá el rol de Administrador a usuarios registrados.
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="colaboradores-filters">
            <div className="filter-search">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                className="filter-input"
              />
            </div>
            <select
              value={filtroRol}
              onChange={e => setFiltroRol(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>

          {/* Estados */}
          {loading && (
            <Loading text="Cargando usuarios..." />
          )}

          {error && (
            <div className="colaboradores-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <p>{error}</p>
              <button onClick={fetchUsuarios} className="btn-retry">Reintentar</button>
            </div>
          )}

          {/* Tabla */}
          {!loading && !error && (
            <>
              <div className="colaboradores-count">
                {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}
              </div>

              {usuariosFiltrados.length === 0 ? (
                <div className="colaboradores-empty">
                  <i className="bi bi-person-x"></i>
                  <p>No se encontraron usuarios con esos criterios.</p>
                </div>
              ) : (
                <div className="colaboradores-table-wrapper">
                  <table className="colaboradores-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol actual</th>
                        <th className="th-action">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.map(u => (
                        <tr key={u._id} className={u.rol === 'admin' ? 'row-admin' : ''}>
                          <td className="td-user">
                            <div className="user-avatar-col">
                              {u.nombre.charAt(0).toUpperCase()}{u.apellido.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-fullname">{u.nombre} {u.apellido}</span>
                          </td>
                          <td className="td-email">{u.email}</td>
                          <td>
                            <span className={`badge-rol badge-${u.rol}`}>
                              {u.rol === 'admin' ? (
                                <><i className="bi bi-shield-fill-check"></i> Admin</>
                              ) : (
                                <><i className="bi bi-person"></i> Cliente</>
                              )}
                            </span>
                          </td>
                          <td className="td-action">
                            <button
                              className={`btn-toggle-rol ${u.rol === 'admin' ? 'btn-quitar' : 'btn-asignar'}`}
                              onClick={() => handleCambiarRol(u)}
                              disabled={loadingRol === u._id}
                              title={u.rol === 'admin' ? 'Quitar rol admin' : 'Dar rol admin'}
                            >
                              {loadingRol === u._id ? (
                                <span className="btn-spinner"></span>
                              ) : u.rol === 'admin' ? (
                                <><i className="bi bi-shield-x"></i> Quitar Admin</>
                              ) : (
                                <><i className="bi bi-shield-plus"></i> Hacer Admin</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className={`col-toast col-toast-${toast.tipo}`}>
          <i className={`bi ${toast.tipo === 'ok' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
          {toast.mensaje}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Colaboradores;
