// Variables de entorno requeridas en .env:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=tu-email@gmail.com
// EMAIL_PASS=tu-app-password  (para Gmail: contraseña de aplicación generada en Google Account > Seguridad)
// EMAIL_FROM="CalmateVibes <noreply@calmatevibes.com>"
// FRONTEND_URL=http://localhost:3000

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOrderConfirmationEmail(email, nombre, pedido) {
    const { numeroPedido, items, subtotal, costoEnvio, total, esRegalo, destinatarioRegalo } = pedido;

    const frontendUrl = process.env.FRONTEND_URL || 'https://calmatex.netlify.app';

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">
          ${item.nombre || item.producto?.nombre || 'Producto'}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;text-align:center;">
          ${item.cantidad}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;text-align:right;">
          $${(item.precioUnitario || 0).toLocaleString('es-AR')}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#52691a;font-size:14px;text-align:right;font-weight:600;">
          $${(item.subtotal || 0).toLocaleString('es-AR')}
        </td>
      </tr>
    `).join('');

    const envioHtml = costoEnvio === 0
      ? '<span style="color:#52691a;font-weight:600;">¡GRATIS!</span>'
      : `$${costoEnvio.toLocaleString('es-AR')}`;

    const regaloHtml = esRegalo && destinatarioRegalo ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border-radius:8px;border-left:4px solid #ffc107;margin-top:24px;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0 0 6px 0;color:#856404;font-size:14px;font-weight:600;">🎁 Este pedido es un regalo para:</p>
            <p style="margin:0;color:#856404;font-size:13px;line-height:1.5;">
              ${destinatarioRegalo.nombre} ${destinatarioRegalo.apellido}
              ${destinatarioRegalo.dedicatoria ? `<br><em>"${destinatarioRegalo.dedicatoria}"</em>` : ''}
            </p>
          </td>
        </tr>
      </table>
    ` : '';

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"CalmateVibes" <noreply@calmatevibes.com>',
      to: email,
      subject: `¡Pedido confirmado! #${numeroPedido} - CalmateVibes`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pedido confirmado</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f8f9fa;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#52691a 0%,#b7c774 100%);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0 0 4px 0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">CalmateVibes</h1>
                      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">¡Tu pedido fue confirmado!</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:36px 40px;">

                      <h2 style="margin:0 0 6px 0;color:#333333;font-size:20px;font-weight:600;">Hola, ${nombre} 👋</h2>
                      <p style="margin:0 0 24px 0;color:#6c757d;font-size:15px;line-height:1.6;">
                        Tu pago fue procesado exitosamente. Aquí encontrás el detalle de tu compra.
                      </p>

                      <!-- Order number -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4e8;border-radius:10px;margin-bottom:28px;">
                        <tr>
                          <td style="padding:18px 24px;">
                            <p style="margin:0;color:#52691a;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Número de pedido</p>
                            <p style="margin:4px 0 0 0;color:#333;font-size:22px;font-weight:700;">#${numeroPedido}</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Items table -->
                      <p style="margin:0 0 12px 0;color:#333;font-size:15px;font-weight:600;">Productos</p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">
                        <thead>
                          <tr style="background-color:#f8f9fa;">
                            <th style="padding:10px 12px;text-align:left;color:#6c757d;font-size:12px;font-weight:600;text-transform:uppercase;">Producto</th>
                            <th style="padding:10px 12px;text-align:center;color:#6c757d;font-size:12px;font-weight:600;text-transform:uppercase;">Cant.</th>
                            <th style="padding:10px 12px;text-align:right;color:#6c757d;font-size:12px;font-weight:600;text-transform:uppercase;">Precio</th>
                            <th style="padding:10px 12px;text-align:right;color:#6c757d;font-size:12px;font-weight:600;text-transform:uppercase;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>

                      <!-- Totals -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                        <tr>
                          <td style="padding:6px 0;color:#6c757d;font-size:14px;">Subtotal</td>
                          <td style="padding:6px 0;color:#333;font-size:14px;text-align:right;">$${(subtotal || 0).toLocaleString('es-AR')}</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#6c757d;font-size:14px;">Envío</td>
                          <td style="padding:6px 0;font-size:14px;text-align:right;">${envioHtml}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0 0 0;color:#333;font-size:16px;font-weight:700;border-top:2px solid #e9ecef;">Total pagado</td>
                          <td style="padding:12px 0 0 0;color:#52691a;font-size:18px;font-weight:700;text-align:right;border-top:2px solid #e9ecef;">$${(total || 0).toLocaleString('es-AR')}</td>
                        </tr>
                      </table>

                      ${regaloHtml}

                      <!-- CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                        <tr>
                          <td align="center">
                            <a href="${frontendUrl}/mis-pedidos"
                               style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#52691a 0%,#b7c774 100%);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                              Ver mis pedidos
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:28px 0 0 0;color:#adb5bd;font-size:13px;line-height:1.6;text-align:center;">
                        Si tenés alguna consulta, podés contactarnos a través de nuestra página o por WhatsApp.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e9ecef;">
                      <p style="margin:0;color:#adb5bd;font-size:12px;">&copy; 2026 CalmateVibes. Todos los derechos reservados.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, nombre, resetUrl) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"CalmateVibes" <noreply@calmatevibes.com>',
      to: email,
      subject: 'Restablecer contraseña - CalmateVibes',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer contraseña</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f8f9fa;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">
                        CalmateVibes
                      </h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 12px 0;color:#333333;font-size:22px;font-weight:600;">
                        Hola, ${nombre}
                      </h2>
                      <p style="margin:0 0 24px 0;color:#6c757d;font-size:15px;line-height:1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en CalmateVibes.
                        Hacé clic en el botón de abajo para crear una nueva contraseña.
                      </p>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:8px 0 32px 0;">
                            <a href="${resetUrl}"
                               style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                              Restablecer contraseña
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Warning -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border-radius:8px;border-left:4px solid #ffc107;">
                        <tr>
                          <td style="padding:16px;">
                            <p style="margin:0;color:#856404;font-size:13px;line-height:1.5;">
                              ⏱ <strong>Este link expira en 10 minutos.</strong><br>
                              Si no solicitaste esto, podés ignorar este email. Tu contraseña actual seguirá siendo la misma.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Fallback URL -->
                      <p style="margin:24px 0 0 0;color:#adb5bd;font-size:12px;line-height:1.5;word-break:break-all;">
                        Si el botón no funciona, copiá y pegá este link en tu navegador:<br>
                        <a href="${resetUrl}" style="color:#28a745;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e9ecef;">
                      <p style="margin:0;color:#adb5bd;font-size:12px;">
                        &copy; 2026 CalmateVibes. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
