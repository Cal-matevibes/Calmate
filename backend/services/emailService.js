const orderConfirmationTemplate = require('../templates/emails/orderConfirmation');
const orderStatusTemplate = require('../templates/emails/orderStatus');
const passwordResetTemplate = require('../templates/emails/passwordReset');

class EmailService {
  async send(to, { subject, html }) {
    const serverToken = process.env.POSTMARK_SERVER_TOKEN;
    const from = process.env.EMAIL_FROM;

    if (!serverToken) {
      throw new Error('Falta configurar POSTMARK_SERVER_TOKEN');
    }
    if (!from) {
      throw new Error('Falta configurar EMAIL_FROM con un remitente verificado en Postmark');
    }

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': serverToken
      },
      body: JSON.stringify({
        From: from,
        To: to,
        Subject: subject,
        HtmlBody: html,
        MessageStream: 'outbound'
      }),
      signal: AbortSignal.timeout(15000)
    });

    const result = await response.json();
    if (!response.ok || result.ErrorCode !== 0) {
      throw new Error(`Postmark rechazó el correo (${result.ErrorCode}): ${result.Message || response.statusText}`);
    }

    return result;
  }

  async sendOrderConfirmationEmail(email, nombre, pedido) {
    await this.send(email, orderConfirmationTemplate({ nombre, ...pedido }));
  }

  async sendOrderStatusEmail(email, nombre, pedido) {
    await this.send(email, orderStatusTemplate({ nombre, ...pedido }));
  }

  async sendPasswordResetEmail(email, nombre, resetUrl) {
    await this.send(email, passwordResetTemplate({ nombre, resetUrl }));
  }
}

module.exports = new EmailService();
