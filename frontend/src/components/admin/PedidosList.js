import React from 'react';
import './styles/PedidosList.css';

function PedidosList({ pedidos, selectedPedido, onPedidoSelect, onStatusUpdate }) {
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
      <span className={`pedido-sestado-badge ${badge.class}`}>
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
      year: 'numeric'
    });
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const handleQuickStatusChange = (e, pedidoId) => {
    e.stopPropagation(); // Evitar que se seleccione el pedido
    const newStatus = e.target.value;
    if (newStatus && newStatus !== 'select') {
      onStatusUpdate(pedidoId, newStatus);
    }
  };

  if (pedidos.length === 0) {
    return (
      <div className="pedidos-list">
        <div className="no-pedidos">
          <i className="bi bi-inbox"></i>
          <h3>No hay pedidos</h3>
          <p>No se encontraron pedidos con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pedidos-list">
      <div className="list-header">
        <h3>Lista de Pedidos</h3>
        <span className="pedidos-count">{pedidos.length} encontrados</span>
      </div>

      <div className="pedidos-items">
        {pedidos.map(pedido => (
          <div
            key={pedido.id}
            className={`pedido-item ${selectedPedido?.id === pedido.id ? 'selected' : ''}`}
            onClick={() => onPedidoSelect(pedido)}
          >
            <div className="pedido-header">
              <div className="pedido-numero">
                <strong>{pedido.numero}</strong>
                {pedido.tracking && (
                  <span className="tracking-indicator">
                    <i className="bi bi-geo-alt"></i>
                    {pedido.tracking}
                  </span>
                )}
              </div>
              
              <div className="pedido-badges">
                {getTipoBadge(pedido.tipo)}
                {getEstadoBadge(pedido.estado)}
              </div>
            </div>

            <div className="pedido-cliente">
              <div className="cliente-info">
                <i className="bi bi-person"></i>
                <span className="cliente-nombre">{pedido.cliente.nombre}</span>
              </div>
              <div className="cliente-contacto">
                <i className="bi bi-envelope"></i>
                <span className="cliente-email">{pedido.cliente.email}</span>
              </div>
            </div>

            <div className="pedido-details">
              <div className="pedido-productos">
                <i className="bi bi-box"></i>
                <span>{pedido.productos.length} producto{pedido.productos.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="pedido-fecha">
                <i className="bi bi-calendar"></i>
                <span>{formatFecha(pedido.fechaPedido)}</span>
              </div>
              
              <div className="pedido-total">
                <i className="bi bi-currency-dollar"></i>
                <strong>{formatMonto(pedido.total)}</strong>
              </div>
            </div>

            {pedido.direccionEnvio && (
              <div className="pedido-direccion">
                <i className="bi bi-geo-alt"></i>
                <span>
                  {pedido.direccionEnvio.ciudad}, {pedido.direccionEnvio.provincia}
                </span>
              </div>
            )}

            {pedido.notas && (
              <div className="pedido-notas">
                <i className="bi bi-chat-left-text"></i>
                <span>{pedido.notas}</span>
              </div>
            )}

            {/* Quick actions */}
            <div className="pedido-actions" onClick={(e) => e.stopPropagation()}>
              <select
                className="quick-status-select"
                value="select"
                onChange={(e) => handleQuickStatusChange(e, pedido.id)}
                title="Cambiar estado rápido"
              >
                <option value="select">Cambiar estado...</option>
                <option value="procesando">Procesando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelar</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PedidosList;