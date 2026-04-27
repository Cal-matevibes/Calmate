const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  crearEnvio,
  obtenerEnvio,
  obtenerPorTracking,
  actualizarEstado,
  registrarIntentoEntrega,
  obtenerTodosEnvios,
  obtenerEnviosPendientes,
  obtenerEnviosRetrasados,
  calcularCostoEnvio,
  actualizarTracking,
  confirmarEntrega
} = require('../controllers/envioController');

const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Rutas públicas
// Tracking público por número
router.get('/tracking/:numero', obtenerPorTracking);

// Calcular costo de envío (público)
router.post('/calcular-costo', [
  body('peso').isFloat({ min: 0 }).withMessage('El peso debe ser un número positivo'),
  body('destino').trim().notEmpty().withMessage('El destino es obligatorio')
    .isLength({ max: 200 }).withMessage('Destino inválido'),
  body('origen').optional().trim().isLength({ max: 200 }).withMessage('Origen inválido'),
], validate, calcularCostoEnvio);

// Rutas que requieren autenticación
router.use(protect);

// Obtener envío específico
router.get('/:id', obtenerEnvio);

// Rutas de administrador
router.use(admin);

// Gestión de envíos (admin)
router.post('/', crearEnvio);
router.get('/', obtenerTodosEnvios);

// Obtener envíos por estado
router.get('/estado/pendientes', obtenerEnviosPendientes);
router.get('/estado/retrasados', obtenerEnviosRetrasados);

// Actualizar estado del envío
router.put('/:id/estado', actualizarEstado);

// Gestión de tracking
router.put('/:id/tracking', actualizarTracking);

// Registrar intento de entrega
router.post('/:id/intento-entrega', registrarIntentoEntrega);

// Confirmar entrega
router.put('/:id/confirmar-entrega', confirmarEntrega);

module.exports = router;