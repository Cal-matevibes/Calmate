const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true
  },
  
  // Características específicas para MATES
  caracteristicasMates: {
    forma: {
      type: String,
      enum: ['Camionero', 'Imperial', 'Torpedo'],
      default: function() { return this.categoria === 'mates' ? 'Imperial' : undefined; }
    },
    tipo: {
      type: String,
      enum: ['Calabaza', 'Algarrobo'],
      default: function() { return this.categoria === 'mates' ? 'Calabaza' : undefined; }
    },
    anchoSuperior: {
      type: String,
      enum: ['Ancho', 'Medio', 'Angosto'],
      default: function() { return this.categoria === 'mates' ? 'Medio' : undefined; }
    },
    anchoInferior: {
      type: String,
      enum: ['Ancho', 'Medio', 'Angosto'],
      default: function() { return this.categoria === 'mates' ? 'Medio' : undefined; }
    },
    virola: {
      type: String,
      enum: ['Si', 'No'],
      default: function() { return this.categoria === 'mates' ? 'No' : undefined; }
    },
    tiposDeVirola: {
      type: String,
      enum: ['Acero', 'Alpaca', 'Bronce', 'ETC'],
      required: function() { 
        return this.categoria === 'mates' && this.caracteristicasMates?.virola === 'Si'; 
      }
    },
    guarda: {
      type: String,
      enum: ['Si', 'No'],
      default: function() { return this.categoria === 'mates' ? 'No' : undefined; }
    },
    tiposDeGuarda: {
      type: String,
      enum: ['Acero', 'Alpaca', 'Bronce', 'ETC'],
      required: function() { 
        return this.categoria === 'mates' && this.caracteristicasMates?.guarda === 'Si'; 
      }
    },
    revestimiento: {
      type: String,
      enum: ['Si', 'No'],
      default: function() { return this.categoria === 'mates' ? 'No' : undefined; }
    },
    tiposDeRevestimientos: {
      type: String,
      enum: ['Cuero natural', 'Alpaca'],
      required: function() { 
        return this.categoria === 'mates' && this.caracteristicasMates?.revestimiento === 'Si'; 
      }
    },
    curados: {
      type: String,
      enum: ['Si', 'No'],
      default: function() { return this.categoria === 'mates' ? 'No' : undefined; }
    },
    tiposDeCurados: {
      type: String,
      enum: ['Curado de calabaza', 'Curado de alpaca'],
      required: function() { 
        return this.categoria === 'mates' && this.caracteristicasMates?.curados === 'Si'; 
      }
    },
    terminacion: {
      type: String,
      enum: ['Brillante', 'ETC']
    },
    grabado: {
      type: String,
      enum: ['Si', 'No'],
      default: function() { return this.categoria === 'mates' ? 'No' : undefined; }
    },
    descripcionDelGrabado: {
      type: String,
      maxlength: [200, 'La descripción del grabado no puede exceder 200 caracteres'],
      required: function() { 
        return this.categoria === 'mates' && this.caracteristicasMates?.grabado === 'Si'; 
      }
    },
    color: {
      type: String,
      trim: true
    }
  },

  // Características específicas para BOMBILLAS
  caracteristicasBombillas: {
    forma: {
      type: String,
      trim: true,
      default: function() { return this.categoria === 'bombillas' ? 'Recta' : undefined; }
    },
    tipoMaterial: {
      type: String,
      trim: true,
      default: function() { return this.categoria === 'bombillas' ? 'Acero inoxidable' : undefined; }
    },
    tamaño: {
      type: String,
      enum: ['Larga', 'Mediana', 'Pequeña'],
      default: function() { return this.categoria === 'bombillas' ? 'Mediana' : undefined; }
    },
    centimetros: {
      type: Number,
      min: [1, 'Los centímetros deben ser mayor a 0'],
      max: [50, 'Los centímetros no pueden exceder 50cm']
    }
  },

  // Características específicas para COMBOS
  caracteristicasCombos: {
    mate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      validate: {
        validator: async function(mateId) {
          if (this.categoria !== 'combos' || !mateId) return true;
          const mate = await mongoose.model('Producto').findById(mateId);
          return mate && mate.categoria === 'mates' && mate.activo;
        },
        message: 'El mate seleccionado debe existir y estar activo'
      }
    },
    bombilla: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      validate: {
        validator: async function(bombillaId) {
          if (this.categoria !== 'combos' || !bombillaId) return true;
          const bombilla = await mongoose.model('Producto').findById(bombillaId);
          return bombilla && bombilla.categoria === 'bombillas' && bombilla.activo;
        },
        message: 'La bombilla seleccionada debe existir y estar activa'
      }
    }
  },

  // Campos comunes
  imagenes: [{
    url: String,
    publicId: String, // Para Cloudinary
    alt: String
  }],
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  precioCompra: {
    type: Number,
    min: [0, 'El precio de compra no puede ser negativo']
  },
  precioVenta: {
    type: Number,
    required: [true, 'El precio de venta es obligatorio'],
    min: [0, 'El precio de venta no puede ser negativo']
  },
  activo: {
    type: Boolean,
    default: true
  },
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  tags: [String],
  slug: {
    type: String,
    unique: true
  },
  // Campos para ofertas
  ofertaActiva: {
    type: Boolean,
    default: false
  },
  precioDescuento: {
    type: Number,
    default: null,
    min: [0, 'El precio de descuento no puede ser negativo']
  },
  tipoDescuento: {
    type: String,
    enum: ['porcentaje', 'precioFijo'],
    default: 'porcentaje'
  },
  tiempoOferta: {
    type: Date,
    default: null // null significa sin fecha límite
  },
  descuentoCategoria: {
    type: Boolean,
    default: false // true si el descuento aplica a la categoría completa
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar performance
ProductoSchema.index({ categoria: 1, activo: 1 });
ProductoSchema.index({ nombre: 'text', descripcion: 'text' });
ProductoSchema.index({ slug: 1 });
ProductoSchema.index({ 'caracteristicasMates.forma': 1 });
ProductoSchema.index({ 'caracteristicasMates.tipo': 1 });
ProductoSchema.index({ 'caracteristicasBombillas.tamaño': 1 });

// Virtual para calcular ganancia
ProductoSchema.virtual('ganancia').get(function() {
  if (this.precioCompra && this.precioVenta) {
    return this.precioVenta - this.precioCompra;
  }
  return 0;
});

// Virtual para obtener características según categoría
ProductoSchema.virtual('caracteristicas').get(function() {
  switch (this.categoria) {
    case 'mates':
      return this.caracteristicasMates;
    case 'bombillas':
      return this.caracteristicasBombillas;
    case 'combos':
      return this.caracteristicasCombos;
    default:
      return {};
  }
});

// Middleware para generar slug único
ProductoSchema.pre('save', async function(next) {
  if (this.isModified('nombre')) {
    const baseSlug = this.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Verificar si el slug ya existe (excluyendo el documento actual si es una actualización)
    while (await this.constructor.findOne({ 
      slug: slug, 
      _id: { $ne: this._id } 
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Middleware para calcular stock de combos
ProductoSchema.pre('save', async function(next) {
  if (this.categoria === 'combos' && 
      this.caracteristicasCombos?.mate && 
      this.caracteristicasCombos?.bombilla) {
    try {
      const mate = await this.constructor.findById(this.caracteristicasCombos.mate);
      const bombilla = await this.constructor.findById(this.caracteristicasCombos.bombilla);
      
      if (mate && bombilla) {
        this.stock = Math.min(mate.stock, bombilla.stock);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Middleware para limpiar características no utilizadas
ProductoSchema.pre('save', function(next) {
  if (this.categoria === 'mates') {
    this.caracteristicasBombillas = undefined;
    this.caracteristicasCombos = undefined;
  } else if (this.categoria === 'bombillas') {
    this.caracteristicasMates = undefined;
    this.caracteristicasCombos = undefined;
  } else if (this.categoria === 'combos') {
    this.caracteristicasMates = undefined;
    this.caracteristicasBombillas = undefined;
  }
  next();
});

module.exports = mongoose.model('Producto', ProductoSchema);