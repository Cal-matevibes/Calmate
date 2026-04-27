const express = require('express');
const router = express.Router();
const miCorreoController = require('../controllers/miCorreoController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/micorreo/estado
 * @desc    Verifica el estado del servicio MiCorreo
 * @access  Public (para que el frontend pueda verificar disponibilidad)
 */
router.get('/estado', miCorreoController.verificarEstado);

/**
 * @route   POST /api/micorreo/rates
 * @desc    Cotiza un envío
 * @access  Private (requiere autenticación)
 */
router.post('/rates', protect, miCorreoController.cotizarEnvio);

/**
 * @route   POST /api/micorreo/shipping/import
 * @desc    Importa un envío a MiCorreo
 * @access  Private (requiere autenticación)
 */
router.post('/shipping/import', protect, miCorreoController.importarEnvio);

/**
 * @route   GET /api/micorreo/shipping/tracking/:shippingId
 * @desc    Obtiene el tracking de un envío
 * @access  Private (requiere autenticación)
 */
router.get('/shipping/tracking/:shippingId', protect, miCorreoController.obtenerTracking);

module.exports = router;
