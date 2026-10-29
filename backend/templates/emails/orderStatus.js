const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

const statusContent = {
  pendiente: {
    label: 'Pendiente',
    title: 'Ya recibimos tu pedido',
    message: 'Tu pedido está registrado. Te avisaremos cuando comencemos a prepararlo.'
  },
  confirmado: {
    label: 'Confirmado',
    title: '¡Tu pedido está confirmado!',
    message: '¡Qué bueno! Ya estamos un paso más cerca de que disfrutes tu compra.'
  },
  procesando: {
    label: 'Procesando',
    title: 'Nos ponemos manos a la obra',
    message: 'Tu pedido está en proceso y nuestro equipo ya está trabajando en él.'
  },
  preparando: {
    label: 'En preparación',
    title: 'Estamos preparando tu pedido',
    message: 'Estamos cuidando cada detalle para que pronto lo tengas con vos.'
  },
  listo_para_envio: {
    label: 'Listo para enviar',
    title: '¡Tu pedido ya está listo!',
    message: 'Terminamos de prepararlo y pronto comenzará su camino hacia vos.'
  },
  enviado: {
    label: 'Enviado',
    title: '¡Tu pedido está en camino!',
    message: 'Tu compra ya fue despachada. ¡Esperamos que llegue muy pronto!'
  },
  entregado: {
    label: 'Entregado',
    title: '¡Tu pedido llegó!',
    message: 'Esperamos que disfrutes mucho tu compra. Gracias por elegir Calmate.'
  },
  cancelado: {
    label: 'Cancelado',
    title: 'Tu pedido fue cancelado',
    message: 'El pedido fue cancelado. Si necesitás ayuda, respondé a este correo y te acompañamos.'
  }
};

const logoUrl = 'https://cal-mate.netlify.app/logo-png.png';

module.exports = ({ nombre, numeroPedido, estado, comentario, numeroSeguimiento }) => {
  const content = statusContent[estado] || {
    label: estado || 'Actualizado',
    title: 'Tenemos novedades sobre tu pedido',
    message: 'El estado de tu pedido fue actualizado.'
  };
  const orderNumber = escapeHtml(numeroPedido || '—');
  const safeName = escapeHtml(nombre || 'amigo/a');
  const tracking = numeroSeguimiento
    ? `<tr>
        <td style="padding:0 28px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f7ef;border:1px solid #e3e9d5;border-radius:10px;">
            <tr><td style="padding:16px 18px;font-family:Arial,sans-serif;color:#3f5115;font-size:14px;line-height:21px;">
              <strong>Tu número de seguimiento</strong><br>
              <span style="font-size:17px;letter-spacing:1px;">${escapeHtml(numeroSeguimiento)}</span>
            </td></tr>
          </table>
        </td>
      </tr>`
    : '';
  const note = comentario
    ? `<tr><td style="padding:0 28px 22px;font-family:Arial,sans-serif;color:#626957;font-size:13px;line-height:20px;">${escapeHtml(comentario)}</td></tr>`
    : '';

  return {
    subject: `${content.label}: novedades de tu pedido ${numeroPedido || ''}`.trim(),
    html: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(content.title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f2ec;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(content.message)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f2ec;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:22px 24px 18px;background-color:#52691a;">
                <img src="${logoUrl}" width="112" alt="Cal-mate" style="display:block;width:112px;max-width:100%;height:auto;border:0;">
                <p style="margin:12px 0 0;font-family:Arial,sans-serif;color:#f5eadc;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Un momento para disfrutar</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:30px 28px 10px;">
                <span style="display:inline-block;padding:7px 14px;border-radius:20px;background-color:#edf2df;color:#52691a;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.6px;text-transform:uppercase;">
                  ${escapeHtml(content.label)}
                </span>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 28px 10px;font-family:Arial,sans-serif;color:#354412;">
                <h1 style="margin:0;font-size:25px;line-height:32px;font-weight:700;">${escapeHtml(content.title)}</h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 34px 22px;font-family:Arial,sans-serif;color:#626957;font-size:15px;line-height:24px;">
                <p style="margin:0;">Hola ${safeName}, ${escapeHtml(content.message)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e8ebdf;border-radius:10px;">
                  <tr>
                    <td style="padding:15px 18px;font-family:Arial,sans-serif;color:#777d6b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Número de pedido</td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 16px;font-family:Arial,sans-serif;color:#354412;font-size:19px;font-weight:bold;">${orderNumber}</td>
                  </tr>
                </table>
              </td>
            </tr>
            ${tracking}
            ${note}
            <tr>
              <td align="center" style="padding:22px 28px;background-color:#f3e8da;border-top:1px solid #e8dccb;">
                <p style="margin:0 0 5px;font-family:Arial,sans-serif;color:#52691a;font-size:15px;font-weight:bold;">Gracias por elegir Calmate</p>
                <p style="margin:0;font-family:Arial,sans-serif;color:#747568;font-size:12px;line-height:19px;">Estamos acá para ayudarte. Respondé este correo si tenés alguna consulta.</p>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-family:Arial,sans-serif;color:#8a8b80;font-size:11px;">Calmate · Hecho para disfrutar cada momento</p>
        </td>
      </tr>
    </table>
  </body>
</html>`
  };
};
