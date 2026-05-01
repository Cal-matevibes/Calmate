const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  actualizarStock,
  getProductosByCategoria,
  searchProductos,
  getProductosDestacados,
  getInventarioResumen
} = require('../controllers/productoController');

const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const productoBodyRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 200 }).withMessage('Nombre demasiado largo'),
  body('precioVenta').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('descripcion').optional().trim()
    .isLength({ max: 2000 }).withMessage('La descripción no puede exceder 2000 caracteres'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo'),
  body('categoria').optional().trim()
    .isLength({ max: 100 }).withMessage('Categoría inválida'),
];

// Rutas públicas (deben ir antes de las rutas con parámetros)
router.get('/search', searchProductos);
router.get('/destacados', getProductosDestacados);
router.get('/categoria/:categoria', getProductosByCategoria);
router.get('/resumen', protect, admin, getInventarioResumen);
router.get('/', getProductos);
router.get('/:id', getProducto);

// Rutas protegidas (solo admin)
router.post('/', protect, admin, productoBodyRules, validate, createProducto);
router.put('/:id', protect, admin, productoBodyRules, validate, updateProducto);
router.put('/:id/stock', protect, admin, [
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo'),
], validate, actualizarStock);
router.delete('/:id', protect, admin, deleteProducto);

module.exports = router;