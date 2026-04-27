const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para proteger rutas (requiere autenticación)
const protect = async (req, res, next) => {
  try {
    console.log('🛡️ === PROTECT MIDDLEWARE ===');
    console.log('📍 URL protegida:', req.originalUrl);
    console.log('📋 Authorization header:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    let token;

    // Verificar si el token está en el header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🎫 Token extraído exitosamente');
    }

    if (!token) {
      console.log('❌ No token encontrado');
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token requerido'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verificado para usuario ID:', decoded.id);
      
      // Obtener usuario del token
      const usuario = await Usuario.findById(decoded.id).select('-password');
      
      if (!usuario) {
        console.log('❌ Usuario no encontrado en la DB');
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario no encontrado'
        });
      }

      if (!usuario.activo) {
        console.log('❌ Usuario desactivado');
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada'
        });
      }

      console.log('✅ Usuario autenticado:', {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      });

      req.usuario = usuario;
      next();
    } catch (error) {
      console.error('❌ Error al verificar token:', error);
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token inválido'
      });
    }
  } catch (error) {
    console.error('Error en middleware protect:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// Middleware para autenticación opcional (no requiere token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Verificar si el token está en el header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Obtener usuario del token
        const usuario = await Usuario.findById(decoded.id).select('-password');
        
        if (usuario && usuario.activo) {
          req.usuario = usuario;
        }
      } catch (error) {
        // Token inválido, pero no bloqueamos la request
        console.log('Token opcional inválido:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware optionalAuth:', error);
    next(); // Continuar sin autenticación
  }
};

// Middleware para verificar rol de administrador
const admin = (req, res, next) => {
  console.log('🔐 === ADMIN MIDDLEWARE ===');
  console.log('👤 Usuario en request:', req.usuario ? {
    id: req.usuario._id,
    email: req.usuario.email,
    rol: req.usuario.rol
  } : 'No usuario');
  
  if (req.usuario && req.usuario.rol === 'admin') {
    console.log('✅ Acceso de admin autorizado');
    next();
  } else {
    console.log('❌ Acceso denegado - no es admin');
    res.status(403).json({
      success: false,
      message: 'Acceso denegado - Se requieren permisos de administrador'
    });
  }
};

// Middleware para verificar múltiples roles
const roles = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.usuario && allowedRoles.includes(req.usuario.rol)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Acceso denegado - Roles permitidos: ${allowedRoles.join(', ')}`
      });
    }
  };
};

// Middleware para verificar si el usuario es propietario del recurso
const owner = (resourceField = 'usuario') => {
  return (req, res, next) => {
    // Este middleware se debe usar después de obtener el recurso
    // y verificar si req.recurso[resourceField] === req.usuario.id
    if (req.usuario.rol === 'admin') {
      // Los admins tienen acceso a todo
      next();
    } else if (req.recurso && req.recurso[resourceField] && 
               req.recurso[resourceField].toString() === req.usuario.id) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado - No eres el propietario de este recurso'
      });
    }
  };
};

// Middleware para verificar estado activo del usuario
const activeUser = (req, res, next) => {
  if (req.usuario && req.usuario.activo) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Cuenta desactivada - Contacta al administrador'
    });
  }
};

// Middleware para rate limiting básico (ejemplo simple)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, { count: 1, firstRequest: now });
      return next();
    }

    const clientData = requests.get(clientId);
    
    if (now - clientData.firstRequest > windowMs) {
      // Resetear ventana
      requests.set(clientId, { count: 1, firstRequest: now });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes - Intenta más tarde'
      });
    }

    clientData.count++;
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  admin,
  roles,
  owner,
  activeUser,
  rateLimit
};