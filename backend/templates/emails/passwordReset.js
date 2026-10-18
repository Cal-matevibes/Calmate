const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = ({ nombre, resetUrl }) => ({
  subject: 'Restablecer tu contraseña - CalmateVibes',
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
    <h2>Hola ${escapeHtml(nombre)},</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p><a href="${escapeHtml(resetUrl)}" style="background:#6b8e7f;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Restablecer contraseña</a></p>
    <p>Si no fuiste vos, ignorá este correo. El enlace expira pronto.</p>
    <p>— CalmateVibes</p>
  </div>`
});
