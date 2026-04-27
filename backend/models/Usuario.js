const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir en queries por defecto
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido']
  },
  fechaNacimiento: {
    type: Date
  },
  rol: {
    type: String,
    enum: ['cliente', 'admin'],
    default: 'cliente'
  },
  activo: {
    type: Boolean,
    default: true
  },
  
  // Dirección de facturación/envío por defecto
  direccion: {
    calle: {
      type: String,
      trim: true
    },
    numero: {
      type: String,
      trim: true
    },
    piso: {
      type: String,
      trim: true
    },
    departamento: {
      type: String,
      trim: true
    },
    ciudad: {
      type: String,
      trim: true
    },
    provincia: {
      type: String,
      trim: true
    },
    codigoPostal: {
      type: String,
      trim: true
    },
    pais: {
      type: String,
      default: 'Argentina',
      trim: true
    }
  },

  // Preferencias del usuario
  preferencias: {
    recibirNotificaciones: {
      type: Boolean,
      default: true
    },
    recibirPromociones: {
      type: Boolean,
      default: true
    }
  },

  // Tokens para reseteo de contraseña
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Última actividad
  ultimoLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ rol: 1, activo: 1 });
UsuarioSchema.index({ 'direccion.ciudad': 1 });

// Virtual para nombre completo
UsuarioSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Middleware para hashear contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hashear contraseña
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Método para generar token de reset
UsuarioSchema.methods.generarResetToken = function() {
  const crypto = require('crypto');
  
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hashear y setear resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Setear expire (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);