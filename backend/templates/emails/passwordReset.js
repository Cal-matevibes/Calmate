const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const logoUrl = 'https://cal-mate.netlify.app/cal.mate%20beige.png';

module.exports = ({ nombre, resetUrl }) => ({
  subject: 'Restablecer tu contraseña - CalmateVibes',
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
    <div style="padding:18px;text-align:center;background:#52691a">
      <img src="${logoUrl}" width="112" alt="Calmate" style="display:block;width:112px;max-width:100%;height:auto;margin:auto;border:0">
    </div>
    <h2>Hola ${escapeHtml(nombre)},</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p><a href="${escapeHtml(resetUrl)}" style="background:#6b8e7f;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Restablecer contraseña</a></p>
    <p>Si no fuiste vos, ignorá este correo. El enlace expira pronto.</p>
    <p>— CalmateVibes</p>
  </div>`
});
