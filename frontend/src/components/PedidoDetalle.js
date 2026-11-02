import React from 'react';
import './styles/PedidoDetalle.css';

const estadoConfig = {
  pendiente: { label: 'Pendiente', icon: 'bi-hourglass-split', className: 'pending' },
  confirmado: { label: 'Confirmado', icon: 'bi-check-circle', className: 'confirmed' },
  procesando: { label: 'Procesando', icon: 'bi-clock-history', className: 'processing' },
  preparando: { label: 'En preparación', icon: 'bi-box-seam', className: 'processing' },
  listo_para_envio: { label: 'Listo para enviar', icon: 'bi-box-seam', className: 'processing' },
  enviado: { label: 'Enviado', icon: 'bi-truck', className: 'shipped' },
  entregado: { label: 'Entregado', icon: 'bi-check-circle-fill', className: 'delivered' },
  cancelado: { label: 'Cancelado', icon: 'bi-x-circle', className: 'cancelled' }
};

const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS'
}).format(Number(price) || 0);

const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Fecha no disponible';

  return parsedDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

function PedidoDetalle({ pedido, onViewDetails }) {
  const status = estadoConfig[pedido.estado] || {
    label: pedido.estado || 'Estado desconocido',
    icon: 'bi-question-circle',
    className: 'unknown'
  };
  const envio = Number(pedido.envio) || 0;
  const total = Number(pedido.total) || 0;
  const subtotal = Math.max(total - envio, 0);

  return (
    <article className="pedido-detalle-card">
      <header className="pedido-detalle-header">
        <div className="pedido-detalle-meta">
          <span className="pedido-detalle-label">Pedido</span>
          <h2>#{pedido.numero}</h2>
          <time dateTime={pedido.fecha} className="pedido-detalle-date">
            <i className="bi bi-calendar3" aria-hidden="true"></i>
            {formatDate(pedido.fecha)}
          </time>
        </div>
        <span className={`pedido-detalle-status pedido-detalle-status--${status.className}`}>
          <i className={`bi ${status.icon}`} aria-hidden="true"></i>
          {status.label}
        </span>
      </header>

      <section className="pedido-detalle-products" aria-label="Productos del pedido">
        {pedido.productos.map((producto, index) => (
          <article className="pedido-detalle-product" key={producto.id || `${producto.nombre}-${index}`}>
            <img
              className="pedido-detalle-image"
              src={producto.imagen || '/placeholder.svg'}
              alt={producto.nombre}
              onError={(event) => {
                event.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="pedido-detalle-product-info">
              <h3>{producto.nombre}</h3>
              <span>{producto.cantidad} {Number(producto.cantidad) === 1 ? 'unidad' : 'unidades'}</span>
            </div>
            <strong className="pedido-detalle-product-price">
              {formatPrice(Number(producto.precio) * Number(producto.cantidad))}
            </strong>
          </article>
        ))}
      </section>

      <section className="pedido-detalle-totals" aria-label="Resumen del pedido">
        <div>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {envio > 0 && (
          <div>
            <span>Envío</span>
            <span>{formatPrice(envio)}</span>
          </div>
        )}
        <div className="pedido-detalle-total">
          <span>Total del pedido</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </section>

      {pedido.tracking && (
        <div className="pedido-detalle-tracking">
          <i className="bi bi-box-seam" aria-hidden="true"></i>
          <span>Seguimiento: <strong>{pedido.tracking}</strong></span>
        </div>
      )}

      <footer className="pedido-detalle-actions">
        <button type="button" className="pedido-detalle-view" onClick={onViewDetails}>
          Ver detalles
          <i className="bi bi-arrow-right" aria-hidden="true"></i>
        </button>
        {pedido.tracking && (
          <a
            className="pedido-detalle-track"
            href={`https://www.correoargentino.com.ar/formularios/ondnc?codigo=${encodeURIComponent(pedido.tracking)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-geo-alt" aria-hidden="true"></i>
            Rastrear envío
          </a>
        )}
      </footer>
    </article>
  );
}

export default PedidoDetalle;
