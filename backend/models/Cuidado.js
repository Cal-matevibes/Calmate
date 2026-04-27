const mongoose = require('mongoose');

const CuidadoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  categoria: {
    type: String,
    enum: ['mate', 'termo', 'bombilla', 'general'],
    default: 'general'
  },
  pasos: [{
    numero: {
      type: Number,
      required: true
    },
    instruccion: {
      type: String,
      required: true,
      trim: true
    }
  }],
  consejos: [{
    type: String,
    trim: true
  }],
  imagenUrl: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para mejorar rendimiento
CuidadoSchema.index({ categoria: 1, activo: 1 });
CuidadoSchema.index({ orden: 1 });

module.exports = mongoose.model('Cuidado', CuidadoSchema);