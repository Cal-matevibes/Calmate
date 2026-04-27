const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    // IDs de MercadoPago
    paymentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Información básica del pago
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back']
    },
    
    // Montos
    transactionAmount: {
        type: Number,
        required: true
    },
    
    // Referencias
    externalReference: {
        type: String,
        required: false
    },
    
    // Información del pagador
    payer: {
        email: String,
        identification: {
            type: {
                type: String, // Tipo de documento (DNI, CUIL, etc.)
                required: false
            },
            number: {
                type: String, // Número del documento
                required: false
            }
        },
        phone: {
            area_code: String,
            number: String
        }
    },
    
    // Método de pago
    paymentMethodId: String,
    paymentTypeId: String,
    
    // Fechas importantes
    dateCreated: {
        type: Date,
        required: true
    },
    dateApproved: Date,
    dateLastUpdated: Date,
    
    // Información de usuario/sesión
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },
    sessionId: String,
    
    // Pedido asociado (solo si el pago fue exitoso)
    pedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedido',
        required: false
    },
    
    // Datos completos de MercadoPago (para auditoria)
    mercadoPagoData: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    
    // Estado de procesamiento interno
    procesado: {
        type: Boolean,
        default: false
    },
    
    // Historial de cambios de estado
    historial: [{
        estado: String,
        fecha: {
            type: Date,
            default: Date.now
        },
        descripcion: String
    }]
}, {
    timestamps: true
});

// Índices para consultas rápidas
pagoSchema.index({ paymentId: 1 });
pagoSchema.index({ status: 1 });
pagoSchema.index({ usuario: 1 });
pagoSchema.index({ 'payer.email': 1 });
pagoSchema.index({ externalReference: 1 });

module.exports = mongoose.model('Pago', pagoSchema);