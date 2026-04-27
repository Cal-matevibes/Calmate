const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const Usuario = require('../models/Usuario');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, resetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ max: 50 }).withMessage('El apellido no puede exceder 50 caracteres'),
  body('email').trim().isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password').isLength({ min: 6, max: 128 })
    .withMessage('La contraseña debe tener entre 6 y 128 caracteres'),
  body('telefono').optional({ checkFalsy: true }).trim()
    .isLength({ max: 30 }).withMessage('Teléfono inválido'),
], validate, async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono } = req.body;

    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese email'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol: 'cliente' // Por defecto es cliente
    });

    // Guardar usuario (el password se encripta automáticamente en el pre-save hook)
    await nuevoUsuario.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: nuevoUsuario._id,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Enviar respuesta (sin incluir la contraseña)
    const usuarioResponse = nuevoUsuario.toObject();
    delete usuarioResponse.password;

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
});

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ max: 128 }).withMessage('Contraseña inválida'),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email (incluir password para verificación)
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'No existe una cuenta con este email'
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña es incorrecta'
      });
    }

    // Actualizar última conexión
    usuario.ultimaConexion = new Date();
    await usuario.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Enviar respuesta (sin incluir la contraseña)
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
});

// @desc    Verificar token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', protect, async (req, res) => {
  try {
    // El middleware auth ya verificó el token y agregó req.usuario
    const usuario = await Usuario.findById(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Enviar datos del usuario (sin contraseña)
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    res.json({
      success: true,
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
});

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
      .populate('pedidos')
      .populate('carrito');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    res.json({
      success: true,
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
});

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { nombre, apellido, telefono, direcciones } = req.body;

    const usuario = await Usuario.findById(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (telefono) usuario.telefono = telefono;
    if (direcciones) usuario.direcciones = direcciones;

    await usuario.save();

    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
});

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    const usuario = await Usuario.findById(req.usuario.id).select('+password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(currentPassword, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña (se encripta automáticamente en el pre-save hook)
    usuario.password = newPassword;
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
});

module.exports = router;