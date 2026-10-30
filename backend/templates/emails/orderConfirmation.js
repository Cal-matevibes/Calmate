const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
const logoUrl = 'https://cal-mate.netlify.app/cal.mate%20beige.png';

module.exports = ({ nombre, numeroPedido, fechaPedido, items = [], subtotal, costoEnvio = 0, total, esRegalo, destinatarioRegalo }) => {
  const filas = items
    .map(
      (i) => `<tr>
        <td style="padding:10px 6px;border-bottom:1px solid #eee">${escapeHtml(i.nombre)}</td>
        <td style="padding:10px 6px;border-bottom:1px solid #eee;text-align:center">${escapeHtml(i.cantidad)}</td>
        <td style="padding:10px 6px;border-bottom:1px solid #eee;text-align:right">${money(i.precioUnitario)}</td>
        <td style="padding:10px 6px;border-bottom:1px solid #eee;text-align:right">${money(i.subtotal)}</td>
      </tr>`
    )
    .join('');
  const cantidadTotal = items.reduce((cantidad, item) => cantidad + Number(item.cantidad || 0), 0);
  const fechaFormateada = fechaPedido
    ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(fechaPedido))
    : null;

  const regalo = esRegalo
    ? `<p>🎁 Este pedido es un regalo${
        destinatarioRegalo && destinatarioRegalo.nombre ? ` para <strong>${escapeHtml(destinatarioRegalo.nombre)}</strong>` : ''
      }.</p>`
    : '';

  return {
    subject: `Confirmación de compra${numeroPedido ? ` - Pedido ${numeroPedido}` : ''}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <div style="padding:18px;text-align:center;background:#52691a">
        <img src="${logoUrl}" width="112" alt="Calmate" style="display:block;width:112px;max-width:100%;height:auto;margin:auto;border:0">
      </div>
      <h2>¡Gracias por tu compra, ${escapeHtml(nombre)}!</h2>
      <p>Tu compra fue registrada correctamente y el pago fue aprobado.</p>
      <p><strong>Número de pedido:</strong> ${escapeHtml(numeroPedido)}${fechaFormateada ? `<br><strong>Fecha:</strong> ${escapeHtml(fechaFormateada)}` : ''}</p>
      ${regalo}
      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th align="left" style="padding:8px 6px;border-bottom:2px solid #52691a">Producto</th>
          <th style="padding:8px 6px;border-bottom:2px solid #52691a">Cantidad</th>
          <th align="right" style="padding:8px 6px;border-bottom:2px solid #52691a">Precio unitario</th>
          <th align="right" style="padding:8px 6px;border-bottom:2px solid #52691a">Subtotal</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <p><strong>Total de unidades:</strong> ${cantidadTotal}</p>
      <p style="text-align:right">
        Subtotal: ${money(subtotal)}<br>
        Envío: ${money(costoEnvio)}<br>
        <strong style="font-size:18px">Total pagado: ${money(total)}</strong>
      </p>
      <p>Te enviaremos novedades cuando haya actualizaciones sobre tu pedido.</p>
      <p>— CalmateVibes</p>
    </div>`
  };
};
