import React, { useState } from 'react';
import './styles/PedidoDetail.css';

function PedidoDetail({ pedido, onStatusUpdate, onOpenTracking, onOpenShipping }) {
  const [statusError, setStatusError] = useState('');
  const estadoLabels = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    procesando: 'Procesando',
    preparando: 'En preparación',
    listo_para_envio: 'Listo para enviar',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };
  const estadoClasses = {
    pendiente: 'badge-pendiente',
    confirmado: 'badge-procesando',
    procesando: 'badge-procesando',
    preparando: 'badge-procesando',
    listo_para_envio: 'badge-procesando',
    enviado: 'badge-enviado',
    entregado: 'badge-entregado',
    cancelado: 'badge-cancelado'
  };
  const tipoLabels = {
    envio: 'Envío',
    envio_domicilio: 'Envío a domicilio',
    correo: 'Correo',
    retiro_local: 'Retiro local',
    devolucion: 'Devolución',
    recambio: 'Recambio'
  };
  const tipoClass = ['devolucion', 'recambio'].includes(pedido.tipo) ? pedido.tipo : 'envio';

  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonto = (monto) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(monto);

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatusError('');

    if (pedido.estado === 'pendiente' && newStatus !== 'pendiente') {
      const email = pedido.cliente.email?.trim();
      if (!email || email === 'No especificado' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatusError('No se puede avanzar: el pedido no tiene un correo válido del comprador.');
        return;
      }

      if (!window.confirm(`Se enviará una actualización del pedido a ${email}. ¿Quieres continuar?`)) {
        return;
      }
    }

    onStatusUpdate(pedido.id, newStatus);
  };

  const canCreateShipping = pedido.estado === 'pendiente';
  const canAddTracking = pedido.estado === 'enviado' && !pedido.tracking;
  const phone = pedido.cliente.telefono?.replace(/\D/g, '') || '';
  const address = pedido.direccionEnvio;
  const addressText = address
    ? [address.calle, address.piso && `Piso ${address.piso}`, address.departamento && `Depto. ${address.departamento}`]
      .filter(Boolean)
      .join(', ')
    : '';
  const hasNotes = Boolean(pedido.notas?.trim());

  return (
    <div className="pedido-detail">
      <header className="detail-header">
        <div>
          <h2>{pedido.numero}</h2>
          <div className="header-badges">
            <span className={`tipo-badge tipo-${tipoClass}`}>
              <i className="bi bi-box-seam"></i>
              {tipoLabels[pedido.tipo] || 'Envío'}
            </span>
            <span className={`estado-badge ${estadoClasses[pedido.estado] || 'badge-pendiente'}`}>
              <i className="bi bi-circle-fill"></i>
              {estadoLabels[pedido.estado] || pedido.estado}
            </span>
          </div>
        </div>
        {pedido.tracking && (
          <div className="tracking-info">
            <i className="bi bi-geo-alt-fill"></i>
            <span>Seguimiento: <strong>{pedido.tracking}</strong></span>
          </div>
        )}
      </header>

      <section className="detail-actions" aria-label="Acciones del pedido">
        <div className="actions-heading">
          <h3>Acciones</h3>
          {statusError && <p className="status-error" role="alert">{statusError}</p>}
        </div>
        <div className="actions-grid">
          <div className="action-group">
            <label htmlFor="pedido-estado">Estado</label>
            <select
              id="pedido-estado"
              className="status-select"
              value={pedido.estado}
              onChange={handleStatusChange}
            >
              {Object.entries(estadoLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {canCreateShipping && (
            <button type="button" className="btn btn-primary" onClick={onOpenShipping}>
              <i className="bi bi-truck"></i>
              Crear envío
            </button>
          )}

          {canAddTracking && (
            <button type="button" className="btn btn-secondary" onClick={onOpenTracking}>
              <i className="bi bi-geo-alt"></i>
              Agregar tracking
            </button>
          )}

          {pedido.tracking && (
            <div className="tracking-action">
              <i className="bi bi-upc-scan"></i>
              <span>{pedido.tracking}</span>
            </div>
          )}

          {phone && (
            <a
              className="btn btn-contact"
              href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${pedido.cliente.nombre}, te contactamos sobre tu pedido ${pedido.numero}. ¿En qué podemos ayudarte?`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-whatsapp"></i>
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </section>

      <section className="detail-section order-section">
        <h3><i className="bi bi-receipt"></i> Información del pedido</h3>
        <div className="order-summary">
          <div className="summary-item">
            <span className="summary-label">Fecha de compra</span>
            <strong>{formatFecha(pedido.fechaCompra || pedido.fechaPedido)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Peso</span>
            <strong>{pedido.peso || 'Sin definir'}</strong>
          </div>
          {pedido.fechaEntrega && (
            <div className="summary-item">
              <span className="summary-label">Entrega estimada</span>
              <strong>{formatFecha(pedido.fechaEntrega)}</strong>
            </div>
          )}
        </div>

        <div className="order-content-grid">
          <div className="order-subsection">
            <h4><i className="bi bi-box-seam"></i> Productos ({pedido.productos.length})</h4>
            <div className="productos-list">
              {pedido.productos.map((producto, index) => (
                <div key={producto.id || `${producto.nombre}-${index}`} className="producto-item">
                  <div className="producto-info">
                    <strong className="producto-nombre">{producto.nombre}</strong>
                    <span className="producto-cantidad">Cantidad: {producto.cantidad}</span>
                  </div>
                  <div className="producto-precio">
                    <span>{formatMonto(producto.precio)} c/u</span>
                    <strong>{formatMonto(producto.precio * producto.cantidad)}</strong>
                  </div>
                </div>
              ))}
              <div className="productos-total">
                <span>Total del pedido</span>
                <strong>{formatMonto(pedido.total)}</strong>
              </div>
            </div>
          </div>

          <div className="order-subsection">
            <h4><i className="bi bi-geo-alt"></i> Dirección de envío</h4>
            {address ? (
              <div className="direccion-details">
                <div>
                  <p>{addressText || 'Dirección no especificada'}</p>
                  <p>{[address.ciudad, address.provincia].filter(Boolean).join(', ')}</p>
                  <p>CP: {address.codigoPostal || 'No especificado'}</p>
                  {address.referencias && <p>Referencias: {address.referencias}</p>}
                </div>
                {addressText && address.ciudad && (
                  <a
                    className="btn-map"
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${addressText}, ${address.ciudad}, ${address.provincia || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-map"></i>
                    Ver mapa
                  </a>
                )}
              </div>
            ) : (
              <p className="empty-detail">Sin dirección de envío</p>
            )}
          </div>
        </div>
      </section>

      <section className="detail-bottom-grid">
        <div className="detail-section">
          <h3><i className="bi bi-person"></i> Cliente</h3>
          <dl className="cliente-details">
            <div className="info-row">
              <dt>Nombre</dt>
              <dd>{pedido.cliente.nombre}</dd>
            </div>
            <div className="info-row">
              <dt>Email</dt>
              <dd>
                {pedido.cliente.email && pedido.cliente.email !== 'No especificado'
                  ? <a href={`mailto:${pedido.cliente.email}`}>{pedido.cliente.email}</a>
                  : 'No especificado'}
              </dd>
            </div>
            <div className="info-row">
              <dt>Teléfono del comprador</dt>
              <dd>
                {pedido.cliente.telefono
                  ? <a href={`tel:${pedido.cliente.telefono}`}>{pedido.cliente.telefono}</a>
                  : 'No informado'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail-section">
          <h3><i className="bi bi-chat-left-text"></i> Notas del pedido</h3>
          {hasNotes
            ? <p className="notas-text">{pedido.notas}</p>
            : <p className="empty-detail">Sin notas</p>}
        </div>
      </section>
    </div>
  );
}

export default PedidoDetail;
