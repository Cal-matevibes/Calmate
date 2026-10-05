// Variables de entorno requeridas en .env:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=tu-email@gmail.com
// EMAIL_PASS=tu-app-password  (para Gmail: contraseña de aplicación generada en Google Account > Seguridad)
// EMAIL_FROM="CalmateVibes <noreply@calmatevibes.com>"
// FRONTEND_URL=http://localhost:3000

const nodemailer = require('nodemailer');
const orderConfirmationTemplate = require('../templates/emails/orderConfirmation');
const passwordResetTemplate = require('../templates/emails/passwordReset');

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

  // Método genérico de envío — usado internamente por todos los helpers
  async send(to, { subject, html }) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || '"CalmateVibes" <noreply@calmatevibes.com>',
      to,
      subject,
      html
    });
  }

  async sendOrderConfirmationEmail(email, nombre, pedido) {
    await this.send(email, orderConfirmationTemplate({ nombre, ...pedido }));
  }

  async sendPasswordResetEmail(email, nombre, resetUrl) {
    await this.send(email, passwordResetTemplate({ nombre, resetUrl }));
  }
}

module.exports = new EmailService();
