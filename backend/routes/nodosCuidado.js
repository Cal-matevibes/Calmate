const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, crear, actualizar, eliminar } = require('../controllers/nodoCuidadoController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const nodoBodyRules = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 200 }).withMessage('Título demasiado largo'),
  body('contenido').optional().trim()
    .isLength({ max: 50000 }).withMessage('El contenido es demasiado largo'),
  body('padre').optional().isMongoId().withMessage('ID de padre inválido'),
  body('cuidado').optional().isMongoId().withMessage('ID de cuidado inválido'),
];

router.get('/', getAll);
router.post('/', protect, admin, nodoBodyRules, validate, crear);
router.put('/:id', protect, admin, nodoBodyRules, validate, actualizar);
router.delete('/:id', protect, admin, eliminar);

module.exports = router;
