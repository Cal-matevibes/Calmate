const express = require('express');
const router = express.Router();
const {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedido,
  actualizarEstadoPedido,
  cancelarPedido,
  obtenerTodosPedidos,
  obtenerEstadisticas,
  procesarPago
} = require('../controllers/pedidoController');

const { protect, admin } = require('../middleware/auth');

// Rutas protegidas (requieren autenticación)
router.use(protect);

// Crear nuevo pedido
router.post('/', crearPedido);

// Obtener mis pedidos
router.get('/mis-pedidos', obtenerMisPedidos);

// Obtener estadísticas (solo admin)
router.get('/estadisticas', admin, obtenerEstadisticas);

// Obtener todos los pedidos (solo admin)
router.get('/', admin, obtenerTodosPedidos);

// Obtener pedido específico
router.get('/:id', obtenerPedido);

// Actualizar estado del pedido (solo admin)
router.put('/:id/estado', admin, actualizarEstadoPedido);

// Procesar pago (solo admin)
router.put('/:id/procesar-pago', admin, procesarPago);

// Cancelar pedido
router.put('/:id/cancelar', cancelarPedido);

module.exports = router;