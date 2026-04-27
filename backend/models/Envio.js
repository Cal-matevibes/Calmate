const mongoose = require('mongoose');

const EnvioSchema = new mongoose.Schema({
  // Pedido asociado
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: true,
    unique: true
  },

  // Información del destinatario
  destinatario: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
      type: String,
      required: true,
      trim: true
    },
    telefono: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },

  // Dirección de envío
  direccion: {
    calle: {
      type: String,
      required: true,
      trim: true
    },
    numero: {
      type: String,
      required: true,
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
    barrio: {
      type: String,
      trim: true
    },
    ciudad: {
      type: String,
      required: true,
      trim: true
    },
    provincia: {
      type: String,
      required: true,
      trim: true
    },
    codigoPostal: {
      type: String,
      required: true,
      trim: true
    },
    referencia: {
      type: String,
      trim: true,
      maxlength: [200, 'La referencia no puede exceder 200 caracteres']
    }
  },

  // Tipo de envío
  tipoEnvio: {
    type: String,
    enum: [
      'domicilio',          // Envío a domicilio
      'punto_retiro',       // Retiro en punto de entrega
      'correo_argentino',   // Correo Argentino
      'oca',               // OCA
      'andreani',          // Andreani
      'mercado_envios'     // Mercado Envíos
    ],
    required: true
  },

  // Empresa transportista
  transportista: {
    nombre: String,
    sucursal: String,
    codigoSucursal: String,
    direccionSucursal: String
  },

  // Estado del envío
  estado: {
    type: String,
    enum: [
      'preparando',        // Preparando el envío
      'listo_despacho',   // Listo para despachar
      'despachado',       // Despachado
      'en_transito',      // En tránsito
      'en_distribucion',  // En distribución local
      'entregado',        // Entregado
      'devuelto',         // Devuelto al remitente
      'perdido',          // Perdido
      'cancelado'         // Cancelado
    ],
    default: 'preparando'
  },

  // Información de tracking
  tracking: {
    numero: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    }
  },

  // Historial de estados
  historial: [{
    estado: {
      type: String,
      required: true
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    descripcion: String,
    ubicacion: String,
    observaciones: String
  }],

  // Costos de envío
  costos: {
    envio: {
      type: Number,
      required: true,
      min: [0, 'El costo de envío no puede ser negativo']
    },
    seguro: {
      type: Number,
      default: 0,
      min: [0, 'El costo del seguro no puede ser negativo']
    },
    empaque: {
      type: Number,
      default: 0,
      min: [0, 'El costo de empaque no puede ser negativo']
    }
  },

  // Información del paquete
  paquete: {
    peso: {
      type: Number,
      required: true,
      min: [0, 'El peso no puede ser negativo']
    },
    dimensiones: {
      largo: Number,
      ancho: Number,
      alto: Number
    },
    cantidadItems: {
      type: Number,
      required: true,
      min: [1, 'Debe haber al menos un item']
    },
    tipoEmpaque: {
      type: String,
      enum: ['caja', 'sobre', 'bolsa', 'tubo'],
      default: 'caja'
    }
  },

  // Fechas importantes
  fechas: {
    estimadaDespacho: Date,
    despacho: Date,
    estimadaEntrega: Date,
    entrega: Date
  },

  // Intentos de entrega
  intentosEntrega: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    motivo: String,
    observaciones: String
  }],

  // Información adicional
  requiereSeguro: {
    type: Boolean,
    default: false
  },
  
  instruccionesEspeciales: {
    type: String,
    maxlength: [500, 'Las instrucciones no pueden exceder 500 caracteres']
  },

  // Información de la persona que recibe
  personaQueRecibe: {
    nombre: String,
    documento: String,
    relacion: String,
    fechaRecepcion: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
EnvioSchema.index({ pedido: 1 });
EnvioSchema.index({ estado: 1 });
EnvioSchema.index({ 'tracking.numero': 1 });
EnvioSchema.index({ tipoEnvio: 1 });
EnvioSchema.index({ 'fechas.estimadaEntrega': 1 });
EnvioSchema.index({ createdAt: -1 });

// Virtual para dirección completa
EnvioSchema.virtual('direccionCompleta').get(function() {
  const dir = this.direccion;
  let direccionCompleta = `${dir.calle} ${dir.numero}`;
  
  if (dir.piso) direccionCompleta += `, Piso ${dir.piso}`;
  if (dir.departamento) direccionCompleta += `, Depto ${dir.departamento}`;
  if (dir.barrio) direccionCompleta += `, ${dir.barrio}`;
  
  direccionCompleta += `, ${dir.ciudad}, ${dir.provincia} (${dir.codigoPostal})`;
  
  return direccionCompleta;
});

// Virtual para costo total de envío
EnvioSchema.virtual('costoTotal').get(function() {
  return this.costos.envio + this.costos.seguro + this.costos.empaque;
});

// Virtual para días desde creación
EnvioSchema.virtual('diasDesdeCreacion').get(function() {
  const dias = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  return dias;
});

// Virtual para verificar si está retrasado
EnvioSchema.virtual('estaRetrasado').get(function() {
  if (!this.fechas.estimadaEntrega) return false;
  return new Date() > this.fechas.estimadaEntrega && this.estado !== 'entregado';
});

// Método para actualizar estado
EnvioSchema.methods.actualizarEstado = function(nuevoEstado, descripcion, ubicacion, observaciones) {
  this.estado = nuevoEstado;
  
  this.historial.push({
    estado: nuevoEstado,
    descripcion: descripcion,
    ubicacion: ubicacion,
    observaciones: observaciones
  });

  // Actualizar fechas específicas según el estado
  switch (nuevoEstado) {
    case 'despachado':
      this.fechas.despacho = new Date();
      break;
    case 'entregado':
      this.fechas.entrega = new Date();
      break;
  }

  return this.save();
};

// Método para registrar intento de entrega
EnvioSchema.methods.registrarIntentoEntrega = function(motivo, observaciones) {
  this.intentosEntrega.push({
    motivo: motivo,
    observaciones: observaciones
  });

  return this.save();
};

// Middleware para agregar el primer estado al historial
EnvioSchema.pre('save', function(next) {
  if (this.isNew && this.historial.length === 0) {
    this.historial.push({
      estado: this.estado,
      descripcion: 'Envío creado'
    });
  }
  next();
});

// Método estático para buscar por número de tracking
EnvioSchema.statics.buscarPorTracking = function(numeroTracking) {
  return this.findOne({ 'tracking.numero': numeroTracking });
};

// Método estático para obtener envíos pendientes
EnvioSchema.statics.obtenerPendientes = function() {
  return this.find({
    estado: { 
      $in: ['preparando', 'listo_despacho', 'despachado', 'en_transito', 'en_distribucion'] 
    }
  });
};

module.exports = mongoose.model('Envio', EnvioSchema);