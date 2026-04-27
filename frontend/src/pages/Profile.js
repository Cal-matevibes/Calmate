import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './styles/Profile.css';
import Loading from '../components/shared/Loading';

function Profile() {
  const { user, getAuthHeaders, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Estado para datos personales
  const [personalData, setPersonalData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  // Estado para direcciones
  const [direcciones, setDirecciones] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    alias: '',
    calle: '',
    numero: '',
    piso: '',
    departamento: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    esPrincipal: false
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setPersonalData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || ''
      });
      setDirecciones(user.direcciones || []);
    }
  }, [user]);

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Manejar cambios en datos personales
  const handlePersonalChange = (e) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar cambios en direcciones
  const handleAddressChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setNewAddress({
      ...newAddress,
      [e.target.name]: value
    });
  };

  // Manejar cambios en contraseña
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Actualizar datos personales
  const handleUpdatePersonalData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(personalData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Datos personales actualizados correctamente');
      } else {
        throw new Error(data.message || 'Error al actualizar datos');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Agregar nueva dirección
  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!newAddress.alias || !newAddress.calle || !newAddress.ciudad) {
      setError('Alias, calle y ciudad son campos obligatorios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedAddresses = [...direcciones, { ...newAddress, _id: Date.now().toString() }];
      
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ direcciones: updatedAddresses })
      });

      const data = await response.json();

      if (data.success) {
        setDirecciones(updatedAddresses);
        setNewAddress({
          alias: '',
          calle: '',
          numero: '',
          piso: '',
          departamento: '',
          ciudad: '',
          provincia: '',
          codigoPostal: '',
          esPrincipal: false
        });
        setShowAddressForm(false);
        setSuccess('Dirección agregada correctamente');
      } else {
        throw new Error(data.message || 'Error al agregar dirección');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar confirmación de eliminación
  const showDeleteConfirmation = (addressId, addressAlias) => {
    setDeleteConfirm({ id: addressId, alias: addressAlias });
  };

  // Eliminar dirección
  const handleDeleteAddress = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    const updatedAddresses = direcciones.filter(addr => addr._id !== deleteConfirm.id);

    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ direcciones: updatedAddresses })
      });

      const data = await response.json();

      if (data.success) {
        setDirecciones(updatedAddresses);
        setSuccess('Dirección eliminada correctamente');
      } else {
        throw new Error(data.message || 'Error al eliminar dirección');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSuccess('Contraseña cambiada correctamente');
      } else {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-wrapper">
        <Header />
        <div className="profile-container">
          <Loading text="Verificando autenticación..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <Header />
      
      <div className="profile-container">
        {/* Header de perfil */}
        <div className="profile-header">
          <div className="header-content">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <i className="bi bi-person-circle"></i>
              </div>
            </div>
            <div className="profile-info">
              <h1>Mi Perfil</h1>
              <p>Gestiona tu información personal y configuración de cuenta</p>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="alert-close">
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle"></i>
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="alert-close">
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        {/* Pestañas */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <i className="bi bi-person"></i>
            Datos Personales
          </button>
          <button 
            className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <i className="bi bi-geo-alt"></i>
            Direcciones
          </button>
          <button 
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="bi bi-shield-lock"></i>
            Seguridad
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="profile-content">
          {/* Pestaña de datos personales */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Datos Personales</h2>
              </div>
              
              <form onSubmit={handleUpdatePersonalData} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">
                      <i className="bi bi-person"></i>
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={personalData.nombre}
                      onChange={handlePersonalChange}
                      required
                      placeholder="Tu nombre"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="apellido">
                      <i className="bi bi-person"></i>
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={personalData.apellido}
                      onChange={handlePersonalChange}
                      required
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="bi bi-envelope"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={personalData.email}
                    onChange={handlePersonalChange}
                    required
                    disabled
                    placeholder="tu@email.com"
                  />
                  <small className="form-hint">
                    El email no se puede modificar. Contacta al soporte si necesitas cambiarlo.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">
                    <i className="bi bi-telephone"></i>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={personalData.telefono}
                    onChange={handlePersonalChange}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check"></i>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Pestaña de direcciones */}
          {activeTab === 'addresses' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Mis Direcciones</h2>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowAddressForm(true)}
                >
                  <i className="bi bi-plus-circle"></i>
                  Agregar Dirección
                </button>
              </div>

              {/* Lista de direcciones */}
              <div className="addresses-grid">
                {direcciones.length === 0 ? (
                  <div className="no-addresses">
                    <i className="bi bi-geo-alt"></i>
                    <h3>No tienes direcciones guardadas</h3>
                    <p>Agrega una dirección para facilitar tus compras</p>
                  </div>
                ) : (
                  direcciones.map((direccion) => (
                    <div key={direccion._id} className="address-card">
                      <div className="address-header">
                        <h4>{direccion.alias}</h4>
                        {direccion.esPrincipal && (
                          <span className="principal-badge">Principal</span>
                        )}
                      </div>
                      <div className="address-content">
                        <p>{direccion.calle} {direccion.numero}</p>
                        {direccion.piso && <p>Piso {direccion.piso} {direccion.departamento}</p>}
                        <p>{direccion.ciudad}, {direccion.provincia}</p>
                        <p>CP: {direccion.codigoPostal}</p>
                      </div>
                      <div className="address-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => setEditingAddress(direccion)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => showDeleteConfirmation(direccion._id, direccion.alias)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario para agregar dirección */}
              {showAddressForm && (
                <div className="modal-overlay" onClick={() => setShowAddressForm(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Agregar Nueva Dirección</h3>
                      <button 
                        className="modal-close"
                        onClick={() => setShowAddressForm(false)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddAddress} className="address-form">
                      <div className="form-group">
                        <label htmlFor="alias">
                          <i className="bi bi-tag"></i>
                          Alias
                        </label>
                        <input
                          type="text"
                          id="alias"
                          name="alias"
                          value={newAddress.alias}
                          onChange={handleAddressChange}
                          required
                          placeholder="Ej: Casa, Trabajo, Casa de mis padres"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="calle">
                            <i className="bi bi-geo-alt"></i>
                            Calle
                          </label>
                          <input
                            type="text"
                            id="calle"
                            name="calle"
                            value={newAddress.calle}
                            onChange={handleAddressChange}
                            required
                            placeholder="Nombre de la calle"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="numero">
                            <i className="bi bi-hash"></i>
                            Número
                          </label>
                          <input
                            type="text"
                            id="numero"
                            name="numero"
                            value={newAddress.numero}
                            onChange={handleAddressChange}
                            placeholder="1234"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="piso">Piso</label>
                          <input
                            type="text"
                            id="piso"
                            name="piso"
                            value={newAddress.piso}
                            onChange={handleAddressChange}
                            placeholder="Opcional"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="departamento">Depto</label>
                          <input
                            type="text"
                            id="departamento"
                            name="departamento"
                            value={newAddress.departamento}
                            onChange={handleAddressChange}
                            placeholder="Opcional"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="ciudad">
                            <i className="bi bi-building"></i>
                            Ciudad
                          </label>
                          <input
                            type="text"
                            id="ciudad"
                            name="ciudad"
                            value={newAddress.ciudad}
                            onChange={handleAddressChange}
                            required
                            placeholder="Tu ciudad"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="provincia">Provincia</label>
                          <input
                            type="text"
                            id="provincia"
                            name="provincia"
                            value={newAddress.provincia}
                            onChange={handleAddressChange}
                            placeholder="Tu provincia"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="codigoPostal">
                          <i className="bi bi-mailbox"></i>
                          Código Postal
                        </label>
                        <input
                          type="text"
                          id="codigoPostal"
                          name="codigoPostal"
                          value={newAddress.codigoPostal}
                          onChange={handleAddressChange}
                          placeholder="1234"
                        />
                      </div>

                      <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="esPrincipal"
                            checked={newAddress.esPrincipal}
                            onChange={handleAddressChange}
                          />
                          <span className="checkbox-custom"></span>
                          Establecer como dirección principal
                        </label>
                      </div>

                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                          {loading ? 'Guardando...' : 'Guardar Dirección'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pestaña de seguridad */}
          {activeTab === 'password' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Cambiar Contraseña</h2>
              </div>

              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <i className="bi bi-lock"></i>
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Tu contraseña actual"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <i className="bi bi-shield-lock"></i>
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <i className="bi bi-shield-check"></i>
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                <div className="password-requirements">
                  <h4>Requisitos de la contraseña:</h4>
                  <ul>
                    <li className={passwordData.newPassword.length >= 6 ? 'valid' : ''}>
                      <i className="bi bi-check-circle"></i>
                      Al menos 6 caracteres
                    </li>
                    <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'valid' : ''}>
                      <i className="bi bi-check-circle"></i>
                      Las contraseñas coinciden
                    </li>
                  </ul>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check"></i>
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button 
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="confirm-content">
                <i className="bi bi-exclamation-triangle warning-icon"></i>
                <h4>¿Estás seguro?</h4>
                <p>
                  Esta acción eliminará permanentemente la dirección 
                  <strong> "{deleteConfirm.alias}"</strong>. 
                  No podrás recuperarla después.
                </p>
              </div>
              
              <div className="confirm-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  <i className="bi bi-x-circle"></i>
                  Cancelar
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAddress}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash"></i>
                      Eliminar Dirección
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;