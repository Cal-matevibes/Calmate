const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Importar el controlador
const {
    crearPreferencia,
    procesarResultado,
    procesarPagoExitoso,
    webhook,
    verificarEstado,
    test
} = require('../controllers/pagoController');

// Ruta de prueba (solo admin)
router.get('/test', protect, admin, test);

// Crear preferencia de pago (requiere autenticación + rate limit)
router.post('/crear-preferencia', paymentLimiter, protect, crearPreferencia);

// Procesar resultado del pago — retorno de MercadoPago (requiere auth)
router.post('/procesar-resultado', protect, procesarResultado);
router.get('/procesar-resultado', protect, procesarResultado);

// Webhook de MercadoPago — llamado server-to-server por MP, no lleva JWT.
// La verificación de firma se hace dentro del controlador con process.env.MP_WEBHOOK_SECRET.
router.post('/webhook', webhook);

// Verificar estado del pago (requiere auth)
router.get(
  '/verificar/:paymentId/:externalReference',
  protect,
  [
    param('paymentId').notEmpty().withMessage('paymentId requerido'),
    param('externalReference').notEmpty().withMessage('externalReference requerido')
  ],
  validate,
  verificarEstado
);

module.exports = router;