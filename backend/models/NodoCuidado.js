const mongoose = require('mongoose');

const NodoCuidadoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  tipo: {
    type: String,
    enum: ['subcategoria', 'documento'],
    required: [true, 'El tipo es obligatorio']
  },
  contenido: {
    type: String,
    default: '',
    trim: true
  },
  // null = nodo raíz directamente bajo una Categoria de la tienda
  padre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NodoCuidado',
    default: null
  },
  // Siempre apunta a la Categoria de la tienda a la que pertenece
  categoriaRaiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría raíz es obligatoria']
  },
  orden: {
    type: Number,
    default: 0
  },
  esHtml: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

NodoCuidadoSchema.index({ categoriaRaiz: 1, activo: 1 });
NodoCuidadoSchema.index({ padre: 1, orden: 1 });

module.exports = mongoose.model('NodoCuidado', NodoCuidadoSchema);
