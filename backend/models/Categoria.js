const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  descripcion: {
    type: String,
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },
  imagen: {
    url: {
      type: String,
      maxlength: [5000000, 'La imagen es demasiado grande']
    },
    alt: {
      type: String,
      maxlength: [100, 'El texto alternativo no puede exceder 100 caracteres']
    }
  },
  activa: {
    type: Boolean,
    default: true
  },
  // Configuración de campos y opciones para cada categoría
  configuracion: {
    campos: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    opciones: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices
CategoriaSchema.index({ nombre: 1, activa: 1 }, { 
  unique: true, 
  partialFilterExpression: { activa: true }, // Solo categorías activas deben ser únicas
  collation: { locale: 'es', strength: 2 } // Insensible a mayúsculas/minúsculas
});
CategoriaSchema.index({ activa: 1, orden: 1 });

module.exports = mongoose.model('Categoria', CategoriaSchema);