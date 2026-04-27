import React, { useState } from 'react';
import './styles/PedidoDetail.css';

function PedidoDetail({ pedido, onStatusUpdate, onOpenTracking, onOpenShipping }) {
  const [showFullNotes, setShowFullNotes] = useState(false);

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { class: 'badge-pendiente', icon: 'bi-clock', text: 'Pendiente' },
      'procesando': { class: 'badge-procesando', icon: 'bi-gear', text: 'Procesando' },
      'enviado': { class: 'badge-enviado', icon: 'bi-truck', text: 'Enviado' },
      'entregado': { class: 'badge-entregado', icon: 'bi-check-circle', text: 'Entregado' },
      'cancelado': { class: 'badge-cancelado', icon: 'bi-x-circle', text: 'Cancelado' }
    };

    const badge = badges[estado] || badges['pendiente'];
    return (
      <span className={`estado-badge ${badge.class}`}>
        <i className={`bi ${badge.icon}`}></i>
        {badge.text}
      </span>
    );
  };

  const getTipoBadge = (tipo) => {
    const tipos = {
      'envio': { class: 'tipo-envio', icon: 'bi-box-seam', text: 'Envío' },
      'devolucion': { class: 'tipo-devolucion', icon: 'bi-arrow-return-left', text: 'Devolución' },
      'recambio': { class: 'tipo-recambio', icon: 'bi-arrow-repeat', text: 'Recambio' }
    };

    const tipoBadge = tipos[tipo] || tipos['envio'];
    return (
      <span className={`tipo-badge ${tipoBadge.class}`}>
        <i className={`bi ${tipoBadge.icon}`}></i>
        {tipoBadge.text}
      </span>
    );
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(pedido.id, newStatus);
  };

  const canCreateShipping = pedido.estado === 'pendiente' || pedido.estado === 'procesando';
  const canAddTracking = pedido.estado === 'enviado' && !pedido.tracking;
  const canViewTracking = pedido.tracking;

  return (
    <div className="pedido-detail">
      <div className="detail-header">
        <div className="header-info">
          <h2>{pedido.numero}</h2>
          <div className="header-badges">
            {getTipoBadge(pedido.tipo)}
            {getEstadoBadge(pedido.estado)}
          </div>
        </div>

        {pedido.tracking && (
          <div className="tracking-info">
            <i className="bi bi-geo-alt-fill"></i>
            <span>Tracking: <strong>{pedido.tracking}</strong></span>
          </div>
        )}
      </div>

      {/* Productos */}
      <div className="detail-section">
        <h3>
          <i className="bi bi-box-fill"></i>
          Productos ({pedido.productos.length})
        </h3>
        <div className="productos-list">
          {pedido.productos.map((producto, index) => (
            <div key={index} className="producto-item">
              <div className="producto-info">
                <span className="producto-nombre">{producto.nombre}</span>
                <span className="producto-cantidad">Cantidad: {producto.cantidad}</span>
              </div>
              <div className="producto-precio">
                <span className="precio-unitario">
                  {formatMonto(producto.precio)} c/u
                </span>
                <span className="precio-total">
                  {formatMonto(producto.precio * producto.cantidad)}
                </span>
              </div>
            </div>
          ))}
          <div className="productos-total">
            <strong>Total: {formatMonto(pedido.total)}</strong>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="detail-section">
        <h3>
          <i className="bi bi-person-fill"></i>
          Información del Cliente
        </h3>
        <div className="cliente-details">
          <div className="info-row">
            <span className="label">Nombre:</span>
            <span className="value">{pedido.cliente.nombre}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">
              <a href={`mailto:${pedido.cliente.email}`}>
                {pedido.cliente.email}
              </a>
            </span>
          </div>
          <div className="info-row">
            <span className="label">Teléfono:</span>
            <span className="value">
              <a href={`tel:${pedido.cliente.telefono}`}>
                {pedido.cliente.telefono}
              </a>
            </span>
          </div>
        </div>
      </div>     

      {/* Dirección de envío */}
      {pedido.direccionEnvio && (
        <div className="detail-section">
          <h3>
            <i className="bi bi-geo-alt-fill"></i>
            Dirección de Envío
          </h3>
          <div className="direccion-details">
            <div className="direccion-completa">
              <p>{pedido.direccionEnvio.calle}</p>
              <p>
                {pedido.direccionEnvio.ciudad}, {pedido.direccionEnvio.provincia}
              </p>
              <p>CP: {pedido.direccionEnvio.codigoPostal}</p>
            </div>
            <button
              className="btn btn-map"
              onClick={() => {
                const direccion = `${pedido.direccionEnvio.calle}, ${pedido.direccionEnvio.ciudad}, ${pedido.direccionEnvio.provincia}`;
                window.open(`https://maps.google.com/?q=${encodeURIComponent(direccion)}`, '_blank');
              }}
            >
              <i className="bi bi-map"></i>
              Ver en Maps
            </button>
          </div>
        </div>
      )}

      <div className="detail-content">
        {/* Fechas importantes */}
        <div className="detail-section">
          <h3>
            <i className="bi bi-calendar-fill"></i>
            Fechas
          </h3>
          <div className="fechas-details">
            <div className="info-row">
              <span className="label">Fecha de pedido:</span>
              <span className="value">{formatFecha(pedido.fechaPedido)}</span>
            </div>
            {pedido.fechaEntrega && (
              <div className="info-row">
                <span className="label">Fecha de entrega:</span>
                <span className="value">{formatFecha(pedido.fechaEntrega)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="detail-actions">
          <h3>Acciones</h3>

          <div className="actions-grid">
            {/* Cambiar estado */}
            <div className="action-group">
              <label>Cambiar Estado:</label>
              <select
                className="status-select"
                value={pedido.estado}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="procesando">Procesando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Crear envío */}
            {canCreateShipping && (
              <button
                className="btn btn-primary btn-shipping"
                onClick={onOpenShipping}
              >
                <i className="bi bi-truck"></i>
                Crear Envío
              </button>
            )}

            {/* Agregar tracking */}
            {canAddTracking && (
              <button
                className="btn btn-secondary btn-tracking"
                onClick={onOpenTracking}
              >
                <i className="bi bi-geo-alt"></i>
                Agregar Tracking
              </button>
            )}

            {/* Ver tracking */}
            {canViewTracking && (
              <button
                className="btn btn-info btn-view-tracking"
                onClick={() => {
                  // Aquí podrías abrir un modal con más detalles del tracking
                  // o redirigir a la página del correo
                  alert(`Tracking: ${pedido.tracking}\n\nEsta funcionalidad se puede expandir para mostrar el estado actual del envío.`);
                }}
              >
                <i className="bi bi-search"></i>
                Ver Tracking
              </button>
            )}

            {/* Imprimir */}
            <button
              className="btn btn-outline btn-print"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer"></i>
              Imprimir
            </button>

            {/* Contactar cliente */}
            <button
              className="btn btn-outline btn-contact"
              onClick={() => {
                const mensaje = `Hola ${pedido.cliente.nombre}, te contactamos sobre tu pedido ${pedido.numero}. ¿En qué podemos ayudarte?`;
                window.open(`https://wa.me/${pedido.cliente.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
              }}
            >
              <i className="bi bi-whatsapp"></i>
              Contactar
            </button>
          </div>
        </div>

        {/* Notas */}
        {pedido.notas && (
          <div className="detail-section">
            <h3>
              <i className="bi bi-chat-left-text-fill"></i>
              Notas del Pedido
            </h3>
            <div className="notas-content">
              <p className={`notas-text ${showFullNotes ? 'expanded' : ''}`}>
                {pedido.notas}
              </p>
              {pedido.notas.length > 100 && (
                <button
                  className="btn-toggle-notes"
                  onClick={() => setShowFullNotes(!showFullNotes)}
                >
                  {showFullNotes ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          </div>
        )}



      </div>


    </div>
  );
}

export default PedidoDetail;