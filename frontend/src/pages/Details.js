import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './styles/Details.css';
import Loading from '../components/shared/Loading';

function Details() {
  const { type, id } = useParams(); // type puede ser 'pedido', 'producto', etc.
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [type, id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      switch (type) {
        case 'pedido':
          endpoint = `/pedidos/${id}`;
          break;
        case 'producto':
          endpoint = `/productos/${id}`;
          break;
        default:
          throw new Error('Tipo de detalle no válido');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.success ? result.data : result);

    } catch (err) {
      setError(err.message || 'Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price || 0);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#ffc107';
      case 'confirmado': return '#17a2b8';
      case 'preparando': return '#fd7e14';
      case 'listo_para_envio': return '#20c997';
      case 'enviado': return '#007bff';
      case 'entregado': return '#28a745';
      case 'cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bi-clock-history';
      case 'confirmado': return 'bi-check-circle';
      case 'preparando': return 'bi-tools';
      case 'listo_para_envio': return 'bi-box-seam';
      case 'enviado': return 'bi-truck';
      case 'entregado': return 'bi-check-circle-fill';
      case 'cancelado': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  };

  const renderPedidoDetails = (pedido) => (
    <div className="details-content">
      {/* Encabezado del Pedido */}
      <div className="details-header">
        <div className="title-section">
          <h1>Pedido #{pedido.numeroPedido || 'Sin número'}</h1>
          <div 
            className="estado-badge large"
            style={{ backgroundColor: getEstadoColor(pedido.estado || 'pendiente') }}
          >
            <i className={`bi ${getEstadoIcon(pedido.estado || 'pendiente')}`}></i>
            {pedido.estado ? 
              pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1).replace('_', ' ') :
              'Pendiente'
            }
          </div>
        </div>
        <button 
          className="btn-back"
          onClick={() => navigate('/mis-pedidos')}
        >
          <i className="bi bi-arrow-left"></i>
          Volver a Mis Pedidos
        </button>
      </div>

      {/* Grid de Información */}
      <div className="details-grid">
        {/* Información General */}
        <div className="detail-card">
          <h2>
            <i className="bi bi-info-circle"></i>
            Información General
          </h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Fecha del Pedido:</span>
              <span>{pedido.createdAt ? formatDate(pedido.createdAt) : 'No especificada'}</span>
            </div>
            <div className="info-item">
              <span className="label">Método de Pago:</span>
              <span>{pedido.metodoPago?.tipo ? 
                (pedido.metodoPago.tipo === 'mercadopago' ? 'MercadoPago' : 
                 pedido.metodoPago.tipo.charAt(0).toUpperCase() + pedido.metodoPago.tipo.slice(1)) : 
                'No especificado'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Estado del Pago:</span>
              <span className={`payment-status ${pedido.metodoPago?.estado || 'pendiente'}`}>
                {pedido.metodoPago?.estado === 'pagado' ? 'Pagado' : 
                 pedido.metodoPago?.estado === 'pendiente' ? 'Pendiente' : 
                 'No especificado'}
              </span>
            </div>
            {pedido.metodoPago?.transaccionId && (
              <div className="info-item">
                <span className="label">ID de Transacción:</span>
                <span className="transaction-id">{pedido.metodoPago.transaccionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Datos de Contacto */}
        <div className="detail-card">
          <h2>
            <i className="bi bi-person"></i>
            Datos de Contacto
          </h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Nombre:</span>
              <span>{`${pedido.datosContacto?.nombre || ''} ${pedido.datosContacto?.apellido || ''}`.trim() || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span>{pedido.datosContacto?.email || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Teléfono:</span>
              <span>{pedido.datosContacto?.telefono || 'No especificado'}</span>
            </div>
          </div>
        </div>

        {/* Dirección de Envío */}
        <div className="detail-card">
          <h2>
            <i className="bi bi-geo-alt"></i>
            Dirección de Envío
          </h2>
          {pedido.direccionEnvio ? (
            <div className="address-info">
              <p>{pedido.direccionEnvio.calle || 'Calle no especificada'} {pedido.direccionEnvio.numero || ''}</p>
              {pedido.direccionEnvio.piso && <p>Piso: {pedido.direccionEnvio.piso}</p>}
              {pedido.direccionEnvio.departamento && <p>Depto: {pedido.direccionEnvio.departamento}</p>}
              <p>{pedido.direccionEnvio.ciudad || 'Ciudad no especificada'}, {pedido.direccionEnvio.provincia || 'Provincia no especificada'}</p>
              <p>CP: {pedido.direccionEnvio.codigoPostal || 'No especificado'}</p>
              <p>País: {pedido.direccionEnvio.pais || 'Argentina'}</p>
              {pedido.direccionEnvio.referencias && (
                <div className="referencias">
                  <strong>Referencias:</strong>
                  <p>{pedido.direccionEnvio.referencias}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">Dirección no especificada</p>
          )}
        </div>

        {/* Información de Envío */}
        <div className="detail-card">
          <h2>
            <i className="bi bi-truck"></i>
            Información de Envío
          </h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Tipo de Envío:</span>
              <span>{pedido.envio?.tipo === 'retiro_local' ? 'Retiro en Local' : 
                     pedido.envio?.tipo === 'envio_domicilio' ? 'Envío a Domicilio' : 
                     pedido.envio?.tipo === 'correo' ? 'Correo Argentino' : 
                     'No especificado'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Costo de Envío:</span>
              <span>{pedido.costoEnvio > 0 ? formatPrice(pedido.costoEnvio) : 'Gratis'}</span>
            </div>
            {pedido.envio?.numeroSeguimiento && (
              <div className="info-item">
                <span className="label">Número de Seguimiento:</span>
                <span className="tracking-number">{pedido.envio.numeroSeguimiento}</span>
              </div>
            )}
            {pedido.envio?.fechaEnvio && (
              <div className="info-item">
                <span className="label">Fecha de Envío:</span>
                <span>{formatDate(pedido.envio.fechaEnvio)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="detail-card full-width">
        <h2>
          <i className="bi bi-box"></i>
          Productos Pedidos
        </h2>
        <div className="productos-table">
          {pedido.items && pedido.items.length > 0 ? (
            <>
              <div className="table-header">
                <div className="col-producto">Producto</div>
                <div className="col-cantidad">Cantidad</div>
                <div className="col-precio">Precio Unit.</div>
                <div className="col-subtotal">Subtotal</div>
              </div>
              {pedido.items.map((item, index) => (
                <div key={index} className="table-row">
                  <div className="col-producto">
                    <div className="producto-info">
                      <div className="producto-nombre">
                        {item.producto?.nombre || 'Producto no disponible'}
                      </div>
                      {item.producto?.descripcion && (
                        <div className="producto-descripcion">
                          {item.producto.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-cantidad">{item.cantidad}</div>
                  <div className="col-precio">{formatPrice(item.precioUnitario)}</div>
                  <div className="col-subtotal">{formatPrice(item.subtotal)}</div>
                </div>
              ))}
            </>
          ) : (
            <p className="no-data">No hay productos en este pedido</p>
          )}
        </div>
      </div>

      {/* Resumen de Totales */}
      <div className="detail-card totales-card">
        <h2>
          <i className="bi bi-calculator"></i>
          Resumen de Totales
        </h2>
        <div className="totales-list">
          <div className="total-item">
            <span>Subtotal:</span>
            <span>{formatPrice(pedido.subtotal || 0)}</span>
          </div>
          <div className="total-item">
            <span>Costo de Envío:</span>
            <span>{formatPrice(pedido.costoEnvio || 0)}</span>
          </div>
          {pedido.descuentos > 0 && (
            <div className="total-item discount">
              <span>Descuentos:</span>
              <span>-{formatPrice(pedido.descuentos)}</span>
            </div>
          )}
          <div className="total-item total">
            <span><strong>Total:</strong></span>
            <span><strong>{formatPrice(pedido.total || 0)}</strong></span>
          </div>
        </div>
      </div>

      {/* Historial de Estados */}
      {pedido.historialEstados && pedido.historialEstados.length > 0 && (
        <div className="detail-card full-width">
          <h2>
            <i className="bi bi-clock-history"></i>
            Historial del Pedido
          </h2>
          <div className="historial-timeline">
            {pedido.historialEstados.map((estado, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <i className={`bi ${getEstadoIcon(estado.estado)}`}></i>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="estado-name">
                      {estado.estado.charAt(0).toUpperCase() + estado.estado.slice(1).replace('_', ' ')}
                    </span>
                    <span className="estado-fecha">
                      {estado.fecha ? formatDate(estado.fecha) : 'Fecha no disponible'}
                    </span>
                  </div>
                  {estado.comentario && (
                    <p className="estado-comentario">{estado.comentario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notas */}
      {(pedido.notas?.cliente || pedido.notas?.admin) && (
        <div className="detail-card full-width">
          <h2>
            <i className="bi bi-chat-dots"></i>
            Notas
          </h2>
          {pedido.notas.cliente && (
            <div className="nota-section">
              <h4>Nota del Cliente:</h4>
              <p>{pedido.notas.cliente}</p>
            </div>
          )}
          {pedido.notas.admin && (
            <div className="nota-section admin">
              <h4>Nota Administrativa:</h4>
              <p>{pedido.notas.admin}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderProductoDetails = (producto) => (
    <div className="details-content">
      <div className="details-header">
        <h1>{producto.nombre || 'Producto'}</h1>
        <button 
          className="btn-back"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i>
          Volver
        </button>
      </div>
      
      <div className="product-details">
        <div className="product-images">
          {producto.imagenes && producto.imagenes.length > 0 ? (
            <img 
              src={producto.imagenes[0].url} 
              alt={producto.nombre}
              onError={(e) => { e.target.src = '/placeholder.svg'; }}
            />
          ) : (
            <div className="no-image">
              <i className="bi bi-image"></i>
              <p>Sin imagen</p>
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h2>{formatPrice(producto.precioVenta)}</h2>
          <p>{producto.descripcion || 'Sin descripción disponible'}</p>
          <div className="product-meta">
            <div className="meta-item">
              <span className="label">Categoría:</span>
              <span>{producto.categoria?.nombre || 'Sin categoría'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Stock:</span>
              <span className={producto.stock > 0 ? 'in-stock' : 'out-stock'}>
                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="details-wrapper">
        <Header />
        <div className="details-container">
          <Loading text="Cargando detalles..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-wrapper">
        <Header />
        <div className="details-container">
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i>
            <h2>Error al cargar los detalles</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn-primary">
              Volver
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="details-wrapper">
      <Header />
      <div className="details-container">
        {type === 'pedido' && data && renderPedidoDetails(data)}
        {type === 'producto' && data && renderProductoDetails(data)}
        {!data && (
          <div className="no-data-message">
            <i className="bi bi-info-circle"></i>
            <h2>No se encontraron detalles</h2>
            <p>No se pudo cargar la información solicitada.</p>
            <button onClick={() => navigate(-1)} className="btn-primary">
              Volver
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Details;