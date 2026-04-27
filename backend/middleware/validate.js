const { validationResult } = require('express-validator');

/**
 * Middleware que lee los errores de express-validator y responde 422
 * si hay alguno. Usar siempre después de los body() / param() checks.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Datos inválidos',
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
    });
  }
  next();
};

module.exports = validate;
