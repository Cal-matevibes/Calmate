const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const emailService = require('../services/emailService');

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/usuarios/registro
// @access  Public
const registrarUsuario = async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      email, 
      password, 
      telefono,
      fechaNacimiento 
    } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password, // Se hashea automáticamente en el modelo
      telefono,
      fechaNacimiento
    });

    if (usuario) {
      res.status(201).json({
        success: true,
        data: {
          _id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          telefono: usuario.telefono,
          token: generarToken(usuario._id)
        }
      });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Autenticar usuario
// @route   POST /api/usuarios/login
// @access  Public
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario y incluir password
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (usuario && (await usuario.verificarPassword(password))) {
      // Actualizar último login
      usuario.ultimoLogin = new Date();
      await usuario.save();

      res.json({
        success: true,
        data: {
          _id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          telefono: usuario.telefono,
          rol: usuario.rol,
          token: generarToken(usuario._id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener perfil del usuario
// @route   GET /api/usuarios/perfil
// @access  Private
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/usuarios/perfil
// @access  Private
const actualizarPerfil = async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      telefono, 
      fechaNacimiento,
      preferencias 
    } = req.body;

    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (telefono) usuario.telefono = telefono;
    if (fechaNacimiento) usuario.fechaNacimiento = fechaNacimiento;
    if (preferencias) usuario.preferencias = { ...usuario.preferencias, ...preferencias };

    const usuarioActualizado = await usuario.save();

    res.json({
      success: true,
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/usuarios/cambiar-password
// @access  Private
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    const usuario = await Usuario.findById(req.usuario.id).select('+password');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    if (!(await usuario.verificarPassword(passwordActual))) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    usuario.password = passwordNuevo;
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Agregar dirección
// @route   POST /api/usuarios/direcciones
// @access  Private
const agregarDireccion = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    usuario.direcciones.push(req.body);
    await usuario.save();

    res.status(201).json({
      success: true,
      data: usuario.direcciones
    });
  } catch (error) {
    console.error('Error al agregar dirección:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar dirección
// @route   PUT /api/usuarios/direcciones/:direccionId
// @access  Private
const actualizarDireccion = async (req, res) => {
  try {
    const { direccionId } = req.params;
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const direccion = usuario.direcciones.id(direccionId);
    
    if (!direccion) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Actualizar campos de la dirección
    Object.assign(direccion, req.body);
    await usuario.save();

    res.json({
      success: true,
      data: usuario.direcciones
    });
  } catch (error) {
    console.error('Error al actualizar dirección:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar dirección
// @route   DELETE /api/usuarios/direcciones/:direccionId
// @access  Private
const eliminarDireccion = async (req, res) => {
  try {
    const { direccionId } = req.params;
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    usuario.direcciones = usuario.direcciones.filter(
      dir => dir._id.toString() !== direccionId
    );
    
    await usuario.save();

    res.json({
      success: true,
      data: usuario.direcciones
    });
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Solicitar reset de contraseña
// @route   POST /api/usuarios/solicitar-reset-password
// @access  Public
const solicitarResetPassword = async (req, res) => {
  // Respuesta genérica para no revelar si el email existe o no
  const mensajeExito = 'Si existe una cuenta con ese email, recibirás las instrucciones en breve';

  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.json({ success: true, message: mensajeExito });
    }

    // Generar token de reset (Bug 1 fix: era crearTokenResetPassword)
    const resetToken = usuario.generarResetToken();
    await usuario.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(usuario.email, usuario.nombre, resetUrl);
    } catch (emailError) {
      // Rollback: limpiar el token si el email falla
      usuario.resetPasswordToken = undefined;
      usuario.resetPasswordExpire = undefined;
      await usuario.save();
      console.error('Error al enviar email de reset:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el email. Por favor, intentá de nuevo más tarde.'
      });
    }

    res.json({ success: true, message: mensajeExito });
  } catch (error) {
    console.error('Error al solicitar reset:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset de contraseña
// @route   PUT /api/usuarios/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Bug 2 fix: hashear el token recibido para comparar con el guardado en BD
    // y usar los nombres de campo correctos del modelo (resetPasswordToken / resetPasswordExpire)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await Usuario.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'El link es inválido o ya expiró. Por favor, solicitá uno nuevo.'
      });
    }

    // Actualizar contraseña y limpiar el token
    usuario.password = password;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpire = undefined;
    
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cambiar rol de un usuario (solo admin)
// @route   PUT /api/usuarios/:id/rol
// @access  Private/Admin
const cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['cliente', 'admin'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Los valores permitidos son: cliente, admin'
      });
    }

    // Un admin no puede cambiar su propio rol
    if (req.usuario._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'No podés cambiar tu propio rol'
      });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { rol },
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario,
      message: `Rol actualizado a "${rol}" correctamente`
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todos los usuarios (solo admin)
// @route   GET /api/usuarios
// @access  Private/Admin
const obtenerUsuarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filtros = {};
    
    // Filtros opcionales
    if (req.query.rol) filtros.rol = req.query.rol;
    if (req.query.activo !== undefined) filtros.activo = req.query.activo === 'true';
    if (req.query.buscar) {
      filtros.$or = [
        { nombre: { $regex: req.query.buscar, $options: 'i' } },
        { apellido: { $regex: req.query.buscar, $options: 'i' } },
        { email: { $regex: req.query.buscar, $options: 'i' } }
      ];
    }

    const usuarios = await Usuario.find(filtros)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Usuario.countDocuments(filtros);

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  agregarDireccion,
  actualizarDireccion,
  eliminarDireccion,
  solicitarResetPassword,
  resetPassword,
  cambiarRolUsuario,
  obtenerUsuarios
};