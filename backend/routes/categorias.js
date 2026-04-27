const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria
} = require('../controllers/categoriaController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/categorias
// @desc    Obtener todas las categorías
// @access  Public
router.get('/', getCategorias);

// @route   GET /api/categorias/:id
// @desc    Obtener categoría por ID
// @access  Public
router.get('/:id', getCategoria);

// @route   POST /api/categorias
// @desc    Crear nueva categoría
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('descripcion')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres'),
  body('imagen.url')
    .optional()
    .isLength({ max: 5000000 })
    .withMessage('La imagen es demasiado grande'),
  body('imagen.alt')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El texto alternativo no puede exceder 100 caracteres')
], createCategoria);

// @route   PUT /api/categorias/:id
// @desc    Actualizar categoría
// @access  Private/Admin
router.put('/:id', [
  protect,
  admin,
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('descripcion')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres'),
  body('imagen.url')
    .optional()
    .isLength({ max: 5000000 })
    .withMessage('La imagen es demasiado grande'),
  body('imagen.alt')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El texto alternativo no puede exceder 100 caracteres')
], updateCategoria);

// @route   DELETE /api/categorias/:id
// @desc    Eliminar categoría (soft delete)
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteCategoria);

module.exports = router;