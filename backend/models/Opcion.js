const mongoose = require('mongoose');

const OpcionSchema = new mongoose.Schema({
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  campo: {
    type: String,
    required: true
  },
  opciones: [{
    valor: String,
    activa: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
OpcionSchema.index({ categoria: 1, campo: 1 });

module.exports = mongoose.model('Opcion', OpcionSchema);