const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  obtenerCarrito,
  agregarProducto,
  actualizarCantidad,
  eliminarProducto,
  limpiarCarrito,
  aplicarDescuento,
  removerDescuento,
  migrarCarrito,
  validarCarrito,
  actualizarInfoRegalo
} = require('../controllers/carritoController');

const { optionalAuth, protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Middleware opcional para autenticación (permite invitados)
router.use(optionalAuth);

// Obtener carrito actual
router.get('/', obtenerCarrito);

// Validar carrito (verificar stock, precios, etc.)
router.get('/validar', validarCarrito);

// Agregar producto al carrito
router.post('/agregar', [
  body('productoId').isMongoId().withMessage('productoId inválido'),
  body('cantidad').isInt({ min: 1, max: 100 }).withMessage('Cantidad debe ser entre 1 y 100'),
], validate, agregarProducto);

// Actualizar cantidad de producto
router.put('/actualizar', [
  body('productoId').isMongoId().withMessage('productoId inválido'),
  body('cantidad').isInt({ min: 0, max: 100 }).withMessage('Cantidad debe ser entre 0 y 100'),
], validate, actualizarCantidad);

// Actualizar información de regalo
router.put('/regalo', [
  body('esRegalo').optional().isBoolean().withMessage('esRegalo debe ser booleano'),
  body('mensajeRegalo').optional().trim().isLength({ max: 500 })
    .withMessage('El mensaje no puede exceder 500 caracteres'),
], validate, actualizarInfoRegalo);

// Eliminar producto específico
router.delete('/eliminar/:productoId', [
  param('productoId').isMongoId().withMessage('productoId inválido'),
], validate, eliminarProducto);

// Limpiar todo el carrito
router.delete('/limpiar', limpiarCarrito);

// Aplicar código de descuento
router.post('/descuento', [
  body('codigo').trim().notEmpty().withMessage('El código es obligatorio')
    .isLength({ max: 50 }).withMessage('Código inválido'),
], validate, aplicarDescuento);

// Remover código de descuento
router.delete('/descuento/:codigo', removerDescuento);

// Migrar carrito de invitado a usuario registrado (requiere auth)
router.post('/migrar', protect, migrarCarrito);

module.exports = router;