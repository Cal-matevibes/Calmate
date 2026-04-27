const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  // Información del cliente
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  
  // Información de contacto (puede diferir del usuario)
  datosContacto: {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      lowercase: true
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true
    }
  },

  // Información de regalo
  esRegalo: {
    type: Boolean,
    default: false
  },
  
  // Datos del destinatario si es regalo
  destinatarioRegalo: {
    nombre: {
      type: String,
      trim: true
    },
    apellido: {
      type: String,
      trim: true
    },
    dedicatoria: {
      type: String,
      trim: true,
      maxlength: [500, 'La dedicatoria no puede exceder 500 caracteres']
    }
  },

  // Items del pedido
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser mayor a 0']
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo']
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo']
    }
  }],

  // Información de envío
  direccionEnvio: {
    calle: {
      type: String,
      required: [true, 'La calle es obligatoria'],
      trim: true
    },
    numero: {
      type: String,
      required: [true, 'El número es obligatorio'],
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
      required: [true, 'La ciudad es obligatoria'],
      trim: true
    },
    provincia: {
      type: String,
      required: [true, 'La provincia es obligatoria'],
      trim: true
    },
    codigoPostal: {
      type: String,
      required: [true, 'El código postal es obligatorio'],
      trim: true
    },
    pais: {
      type: String,
      default: 'Argentina',
      trim: true
    },
    referencias: {
      type: String,
      trim: true,
      maxlength: [200, 'Las referencias no pueden exceder 200 caracteres']
    }
  },

  // Totales
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'El subtotal no puede ser negativo']
  },
  costoEnvio: {
    type: Number,
    default: 0,
    min: [0, 'El costo de envío no puede ser negativo']
  },
  descuentos: {
    type: Number,
    default: 0,
    min: [0, 'Los descuentos no pueden ser negativos']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'El total no puede ser negativo']
  },

  // Estado del pedido
  estado: {
    type: String,
    enum: [
      'pendiente',           // Recién creado
      'confirmado',          // Confirmado por el admin
      'preparando',          // En preparación
      'listo_para_envio',    // Listo para enviar
      'enviado',             // Enviado
      'entregado',           // Entregado
      'cancelado'            // Cancelado
    ],
    default: 'pendiente'
  },

  // Historial de estados
  historialEstados: [{
    estado: {
      type: String,
      required: true
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    comentario: {
      type: String,
      trim: true
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  }],

  // Método de pago
  metodoPago: {
    tipo: {
      type: String,
      enum: ['efectivo', 'transferencia', 'mercadopago', 'tarjeta'],
      required: true
    },
    estado: {
      type: String,
      enum: ['pendiente', 'pagado', 'rechazado'],
      default: 'pendiente'
    },
    transaccionId: String,
    comprobante: String
  },

  // Información de envío
  envio: {
    tipo: {
      type: String,
      enum: ['retiro_local', 'envio_domicilio', 'correo'],
      required: true
    },
    empresa: String,
    numeroSeguimiento: String,
    fechaEnvio: Date,
    fechaEntregaEstimada: Date,
    fechaEntregaReal: Date
  },

  // Notas adicionales
  notas: {
    cliente: {
      type: String,
      trim: true,
      maxlength: [500, 'Las notas del cliente no pueden exceder 500 caracteres']
    },
    admin: {
      type: String,
      trim: true,
      maxlength: [500, 'Las notas del admin no pueden exceder 500 caracteres']
    }
  },

  // Información específica de MercadoPago
  mercadoPago: {
    preferenceId: {
      type: String,
      trim: true
    },
    paymentId: {
      type: String,
      trim: true
    },
    externalReference: {
      type: String,
      trim: true
    },
    initPoint: {
      type: String,
      trim: true
    },
    sandboxInitPoint: {
      type: String,
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      trim: true
    },
    paymentType: {
      type: String,
      trim: true
    },
    transactionAmount: {
      type: Number
    },
    dateApproved: {
      type: Date
    },
    dateCreated: {
      type: Date
    }
  },

  // Número de pedido único
  numeroPedido: {
    type: String,
    unique: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
PedidoSchema.index({ usuario: 1, createdAt: -1 });
PedidoSchema.index({ estado: 1, createdAt: -1 });
PedidoSchema.index({ numeroPedido: 1 });
PedidoSchema.index({ 'metodoPago.estado': 1 });
PedidoSchema.index({ 'envio.numeroSeguimiento': 1 });

// Virtual para cantidad total de items
PedidoSchema.virtual('cantidadTotalItems').get(function() {
  return this.items.reduce((total, item) => total + item.cantidad, 0);
});

// Middleware para generar número de pedido
PedidoSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generar número de pedido único
    const count = await this.constructor.countDocuments();
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.numeroPedido = `CV-${fecha}-${String(count + 1).padStart(4, '0')}`;
    
    // Agregar estado inicial al historial
    this.historialEstados.push({
      estado: this.estado,
      fecha: new Date(),
      comentario: 'Pedido creado'
    });
  }
  next();
});

// Middleware para actualizar historial de estados
PedidoSchema.pre('save', function(next) {
  if (this.isModified('estado') && !this.isNew) {
    this.historialEstados.push({
      estado: this.estado,
      fecha: new Date(),
      comentario: `Estado actualizado a: ${this.estado}`
    });
  }
  next();
});

module.exports = mongoose.model('Pedido', PedidoSchema);