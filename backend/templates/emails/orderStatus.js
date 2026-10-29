const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

const statusLabels = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  procesando: 'Procesando',
  preparando: 'En preparación',
  listo_para_envio: 'Listo para enviar',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

module.exports = ({ nombre, numeroPedido, estado, comentario, numeroSeguimiento }) => {
  const estadoLabel = statusLabels[estado] || estado;
  const tracking = numeroSeguimiento
    ? `<p>Número de seguimiento: <strong>${escapeHtml(numeroSeguimiento)}</strong></p>`
    : '';
  const observaciones = comentario
    ? `<p>${escapeHtml(comentario)}</p>`
    : '';

  return {
    subject: `Actualización de tu pedido ${numeroPedido || ''}: ${estadoLabel}`.trim(),
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2>Hola ${escapeHtml(nombre || 'Cliente')},</h2>
      <p>El estado de tu pedido <strong>${escapeHtml(numeroPedido || '')}</strong> se actualizó a <strong>${escapeHtml(estadoLabel)}</strong>.</p>
      ${observaciones}
      ${tracking}
      <p>— CalmateVibes</p>
    </div>`
  };
};
