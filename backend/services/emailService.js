const crypto = require('crypto');
const EmailCredential = require('../models/EmailCredential');
const orderConfirmationTemplate = require('../templates/emails/orderConfirmation');
const orderStatusTemplate = require('../templates/emails/orderStatus');
const passwordResetTemplate = require('../templates/emails/passwordReset');

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

const getOAuthConfig = () => {
  const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI } = process.env;
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REDIRECT_URI) {
    throw new Error('Falta configurar las credenciales OAuth de Google');
  }
  return { clientId: GOOGLE_OAUTH_CLIENT_ID, clientSecret: GOOGLE_OAUTH_CLIENT_SECRET, redirectUri: GOOGLE_OAUTH_REDIRECT_URI };
};

const getSetupKey = () => {
  const key = process.env.GOOGLE_OAUTH_SETUP_KEY;
  if (!key || key.length < 32) {
    throw new Error('GOOGLE_OAUTH_SETUP_KEY debe tener al menos 32 caracteres');
  }
  return key;
};

const isSetupKeyValid = (candidate) => {
  const configured = process.env.GOOGLE_OAUTH_SETUP_KEY;
  if (!configured || typeof candidate !== 'string') return false;
  const expectedBuffer = Buffer.from(configured);
  const candidateBuffer = Buffer.from(candidate);
  return expectedBuffer.length === candidateBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
};

const getEncryptionKey = () => {
  const value = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;
  if (!value || !/^[a-f\d]{64}$/i.test(value)) {
    throw new Error('GMAIL_TOKEN_ENCRYPTION_KEY debe ser una clave hexadecimal de 32 bytes');
  }
  return Buffer.from(value, 'hex');
};

const createOAuthState = () => {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(24).toString('hex');
  const payload = `${timestamp}.${nonce}`;
  const signature = crypto.createHmac('sha256', getSetupKey()).update(payload).digest('hex');
  return `${payload}.${signature}`;
};

const verifyOAuthState = (state) => {
  if (typeof state !== 'string') return false;
  const parts = state.split('.');
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f\d]{48}$/i.test(parts[1])) return false;

  const timestamp = Number(parts[0]);
  if (!Number.isSafeInteger(timestamp) || Date.now() - timestamp > OAUTH_STATE_MAX_AGE_MS || timestamp > Date.now() + 30_000) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', getSetupKey()).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(parts[2], 'hex');
  } catch {
    return false;
  }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const encryptRefreshToken = (refreshToken) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(refreshToken, 'utf8'), cipher.final()]);
  return {
    encryptedRefreshToken: encrypted.toString('base64'),
    refreshTokenIv: iv.toString('hex'),
    refreshTokenAuthTag: cipher.getAuthTag().toString('hex')
  };
};

const decryptRefreshToken = (credential) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(credential.refreshTokenIv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(credential.refreshTokenAuthTag, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(credential.encryptedRefreshToken, 'base64')),
    decipher.final()
  ]).toString('utf8');
};

const encodeMimeBody = (value) => Buffer.from(value, 'utf8')
  .toString('base64')
  .match(/.{1,76}/g)
  .join('\r\n');

const encodeMimeSubject = (subject) => {
  const words = [];
  let chunk = '';
  for (const character of subject) {
    if (Buffer.byteLength(chunk + character, 'utf8') > 42) {
      words.push(`=?UTF-8?B?${Buffer.from(chunk, 'utf8').toString('base64')}?=`);
      chunk = '';
    }
    chunk += character;
  }
  if (chunk) words.push(`=?UTF-8?B?${Buffer.from(chunk, 'utf8').toString('base64')}?=`);
  return words.join('\r\n ');
};

class EmailService {
  constructor() {
    this.accessToken = null;
    this.accessTokenExpiresAt = 0;
  }

  createAuthorizationUrl(setupKey) {
    if (!isSetupKeyValid(setupKey)) {
      const error = new Error('Clave de configuración inválida');
      error.statusCode = 401;
      throw error;
    }

    const config = getOAuthConfig();
    const senderEmail = process.env.GMAIL_SENDER_EMAIL;
    if (!senderEmail) throw new Error('Falta configurar GMAIL_SENDER_EMAIL');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: GMAIL_SEND_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      login_hint: senderEmail,
      state: createOAuthState()
    }).toString();
    return url.toString();
  }

  async handleOAuthCallback(code, state) {
    if (!verifyOAuthState(state)) {
      throw new Error('El estado OAuth es inválido o expiró. Inicia nuevamente la autorización.');
    }

    const config = getOAuthConfig();
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      }),
      signal: AbortSignal.timeout(15000)
    });
    const tokens = await response.json();
    if (!response.ok) {
      throw new Error(`Google no pudo completar la autorización: ${tokens.error_description || tokens.error || response.statusText}`);
    }
    if (!tokens.refresh_token) {
      throw new Error('Google no devolvió un refresh token. Revoca el acceso previo de Calmate a tu cuenta y vuelve a autorizar.');
    }

    await EmailCredential.findOneAndUpdate(
      { provider: 'gmail' },
      {
        provider: 'gmail',
        ...encryptRefreshToken(tokens.refresh_token)
      },
      { upsert: true, new: true, runValidators: true }
    );
    this.accessToken = null;
    this.accessTokenExpiresAt = 0;
  }

  async getAccessToken() {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const credential = await EmailCredential.findOne({ provider: 'gmail' });
    if (!credential) {
      throw new Error('Gmail aún no está autorizado. Completa la configuración OAuth de correo.');
    }

    const config = getOAuthConfig();
    const refreshToken = decryptRefreshToken(credential);
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok || !result.access_token) {
      this.accessToken = null;
      this.accessTokenExpiresAt = 0;
      throw new Error(`Google no pudo renovar el acceso a Gmail: ${result.error_description || result.error || response.statusText}`);
    }

    this.accessToken = result.access_token;
    this.accessTokenExpiresAt = Date.now() + (result.expires_in || 3600) * 1000;
    return this.accessToken;
  }

  async send(to, { subject, html }) {
    const from = process.env.GMAIL_SENDER_EMAIL;
    if (!from) throw new Error('Falta configurar GMAIL_SENDER_EMAIL');
    if (typeof to !== 'string' || /[\r\n]/.test(to) || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(to)) {
      throw new Error('La dirección de correo del destinatario no es válida');
    }
    if (typeof subject !== 'string' || /[\r\n]/.test(subject)) {
      throw new Error('El asunto del correo no es válido');
    }

    const mimeMessage = [
      `From: Calmate <${from}>`,
      `To: ${to}`,
      `Subject: ${encodeMimeSubject(subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodeMimeBody(html)
    ].join('\r\n');
    const accessToken = await this.getAccessToken();
    const response = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: Buffer.from(mimeMessage, 'utf8').toString('base64url') }),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Gmail API rechazó el correo: ${result.error?.message || response.statusText}`);
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

const emailService = new EmailService();
module.exports = emailService;
