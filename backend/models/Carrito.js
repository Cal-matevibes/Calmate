const mongoose = require('mongoose');

const CarritoSchema = new mongoose.Schema({
  // Usuario (puede ser null para carritos de invitados)
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    sparse: true // Permite múltiples documentos con usuario null
  },
  
  // ID de sesión para carritos de invitados
  sessionId: {
    type: String,
    sparse: true
  },

  // Items del carrito
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser mayor a 0'],
      max: [99, 'La cantidad no puede exceder 99 unidades']
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo']
    },
    fechaAgregado: {
      type: Date,
      default: Date.now
    }
  }],

  // Información de descuentos aplicados
  descuentos: [{
    codigo: String,
    tipo: {
      type: String,
      enum: ['porcentaje', 'monto_fijo']
    },
    valor: Number,
    descripcion: String
  }],

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

  // Estado del carrito
  activo: {
    type: Boolean,
    default: true
  },

  // Fecha de expiración (para carritos de invitados)
  expiraEn: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
CarritoSchema.index({ usuario: 1, activo: 1 });
CarritoSchema.index({ sessionId: 1, activo: 1 });
CarritoSchema.index({ expiraEn: 1 });
CarritoSchema.index({ 'items.producto': 1 });

// Índice compuesto para evitar duplicados
CarritoSchema.index(
  { usuario: 1, sessionId: 1 },
  { 
    unique: true,
    partialFilterExpression: { activo: true }
  }
);

// Virtual para subtotal del carrito
CarritoSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.cantidad * item.precioUnitario);
  }, 0);
});

// Virtual para cantidad total de items
CarritoSchema.virtual('cantidadTotalItems').get(function() {
  return this.items.reduce((total, item) => total + item.cantidad, 0);
});

// Virtual para total con descuentos
CarritoSchema.virtual('total').get(function() {
  let total = this.subtotal;
  
  this.descuentos.forEach(descuento => {
    if (descuento.tipo === 'porcentaje') {
      total = total * (1 - descuento.valor / 100);
    } else if (descuento.tipo === 'monto_fijo') {
      total = Math.max(0, total - descuento.valor);
    }
  });
  
  return Math.round(total * 100) / 100; // Redondear a 2 decimales
});

// Método para agregar producto al carrito
CarritoSchema.methods.agregarProducto = function(productoId, cantidad, precio) {
  const itemExistente = this.items.find(
    item => item.producto.toString() === productoId.toString()
  );

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    this.items.push({
      producto: productoId,
      cantidad: cantidad,
      precioUnitario: precio
    });
  }

  return this.save();
};

// Método para actualizar cantidad de un producto
CarritoSchema.methods.actualizarCantidad = function(productoId, nuevaCantidad) {
  const item = this.items.find(
    item => item.producto.toString() === productoId.toString()
  );

  if (item) {
    if (nuevaCantidad <= 0) {
      this.items = this.items.filter(
        item => item.producto.toString() !== productoId.toString()
      );
    } else {
      item.cantidad = nuevaCantidad;
    }
  }

  return this.save();
};

// Método para eliminar producto del carrito
CarritoSchema.methods.eliminarProducto = function(productoId) {
  this.items = this.items.filter(
    item => item.producto.toString() !== productoId.toString()
  );
  
  return this.save();
};

// Método para limpiar carrito
CarritoSchema.methods.limpiar = function() {
  this.items = [];
  this.descuentos = [];
  return this.save();
};

// Middleware para limpiar carritos expirados
CarritoSchema.pre('find', function() {
  // Opcional: filtrar carritos expirados
  // this.where({ expiraEn: { $gt: new Date() } });
});

module.exports = mongoose.model('Carrito', CarritoSchema);