const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ofertaController = require('../controllers/ofertaController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const ofertaBodyRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 200 }).withMessage('Nombre demasiado largo'),
  body('descuento').isFloat({ min: 0, max: 100 })
    .withMessage('El descuento debe ser un número entre 0 y 100'),
  body('tipo').optional().isIn(['porcentaje', 'monto_fijo'])
    .withMessage('Tipo inválido: debe ser porcentaje o monto_fijo'),
  body('fechaInicio').optional().isISO8601().withMessage('Fecha de inicio inválida'),
  body('fechaFin').optional().isISO8601().withMessage('Fecha de fin inválida'),
];

// Rutas públicas
router.get('/', ofertaController.getOfertas);
router.get('/:id', ofertaController.getOfertaById);
router.get('/categoria/:categoria', ofertaController.getOfertasByCategoria);
router.get('/calcular/:productoId', ofertaController.calcularPrecioDescuento);

// Rutas protegidas (admin)
router.post('/', protect, admin, ofertaBodyRules, validate, ofertaController.createOferta);
router.put('/:id', protect, admin, ofertaBodyRules, validate, ofertaController.updateOferta);
router.delete('/:id', protect, admin, ofertaController.deleteOferta);
router.delete('/categoria/:categoria', protect, admin, ofertaController.deleteOfertaCategoria);

module.exports = router;
