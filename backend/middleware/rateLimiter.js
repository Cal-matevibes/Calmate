const rateLimit = require('express-rate-limit');

/** Login / registro: máx 10 intentos por IP en 15 minutos */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.'
  }
});

/** Reset de contraseña: máx 5 solicitudes por IP en 60 minutos */
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de reset. Esperá 1 hora.'
  }
});

/** Crear preferencia de pago: máx 30 por IP en 10 minutos */
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de pago. Intentá más tarde.'
  }
});

module.exports = { authLimiter, resetLimiter, paymentLimiter };
