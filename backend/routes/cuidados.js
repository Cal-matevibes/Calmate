const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getCuidados,
  getCuidado,
  createCuidado,
  updateCuidado,
  deleteCuidado
} = require('../controllers/cuidadoController');

const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const cuidadoBodyRules = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 200 }).withMessage('Título demasiado largo'),
  body('contenido').optional().trim()
    .isLength({ max: 50000 }).withMessage('El contenido es demasiado largo'),
  body('categoria').optional().trim()
    .isLength({ max: 100 }).withMessage('Categoría inválida'),
];

// Rutas públicas
router.get('/', getCuidados);
router.get('/:id', getCuidado);

// Rutas protegidas (solo admin)
router.post('/', protect, admin, cuidadoBodyRules, validate, createCuidado);
router.put('/:id', protect, admin, cuidadoBodyRules, validate, updateCuidado);
router.delete('/:id', protect, admin, deleteCuidado);

module.exports = router;