const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
const logoUrl = 'https://cal-mate.netlify.app/cal.mate%20beige.png';

module.exports = ({ nombre, numeroPedido, items = [], subtotal, costoEnvio = 0, total, esRegalo, destinatarioRegalo }) => {
  const filas = items
    .map(
      (i) => `<tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(i.nombre)}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${escapeHtml(i.cantidad)}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${money(i.precioUnitario)}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${money(i.subtotal)}</td>
      </tr>`
    )
    .join('');

  const regalo = esRegalo
    ? `<p>🎁 Este pedido es un regalo${
        destinatarioRegalo && destinatarioRegalo.nombre ? ` para <strong>${escapeHtml(destinatarioRegalo.nombre)}</strong>` : ''
      }.</p>`
    : '';

  return {
    subject: `Confirmación de tu pedido ${numeroPedido || ''}`.trim(),
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <div style="padding:18px;text-align:center;background:#52691a">
        <img src="${logoUrl}" width="112" alt="Calmate" style="display:block;width:112px;max-width:100%;height:auto;margin:auto;border:0">
      </div>
      <h2>¡Gracias por tu compra, ${escapeHtml(nombre)}!</h2>
      <p>Recibimos tu pedido <strong>${escapeHtml(numeroPedido)}</strong>.</p>
      ${regalo}
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th align="left">Producto</th><th>Cant.</th><th align="right">Precio</th><th align="right">Subtotal</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <p>Subtotal: ${money(subtotal)}<br>Envío: ${money(costoEnvio)}<br><strong>Total: ${money(total)}</strong></p>
      <p>— CalmateVibes</p>
    </div>`
  };
};
