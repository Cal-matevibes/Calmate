import React, { useState } from 'react';
import './styles/ShippingModal.css';

function ShippingModal({ pedido, onClose, onCreateShipping }) {
  const [formData, setFormData] = useState({
    servicio: 'correo-argentino',
    tipoEnvio: 'domicilio',
    fechaEstimada: '',
    costo: '',
    seguro: false,
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Configuración, 2: Confirmación

  const serviciosEnvio = [
    { 
      value: 'correo-argentino', 
      label: 'Correo Argentino',
      tiempoEstimado: '3-5 días hábiles',
      costo: 2500
    },
    { 
      value: 'express', 
      label: 'Envío Express',
      tiempoEstimado: '24-48 horas',
      costo: 5500
    }
  ];

  const tiposEnvio = [
    { value: 'domicilio', label: 'Entrega a Domicilio', icon: 'bi-house' },
    { value: 'sucursal', label: 'Retiro en Sucursal', icon: 'bi-building' },
    { value: 'punto', label: 'Punto de Retiro', icon: 'bi-geo-alt' }
  ];

  const calcularFechaEstimada = (servicio) => {
    const dias = {
      'correo-argentino': 5,
      'oca': 4,
      'andreani': 3,
      'mercado-envios': 4,
      'express': 2
    };
    
    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() + (dias[servicio] || 5));
    return fechaBase.toISOString().split('T')[0];
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calcular fecha estimada y costo cuando cambia el servicio
      if (field === 'servicio') {
        const servicioInfo = serviciosEnvio.find(s => s.value === value);
        newData.fechaEstimada = calcularFechaEstimada(value);
        newData.costo = servicioInfo?.costo || '';
      }
      
      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.servicio) return 'Selecciona un servicio de envío';
    if (!formData.tipoEnvio) return 'Selecciona un tipo de envío';
    if (!formData.fechaEstimada) return 'Ingresa una fecha estimada de entrega';
    if (!formData.costo || formData.costo <= 0) return 'Ingresa un costo válido';
    return '';
  };

  const generateTrackingNumber = (servicio) => {
    const prefixes = {
      'correo-argentino': 'AR',
      'oca': 'OCA',
      'andreani': 'AND',
      'mercado-envios': 'ME',
      'express': 'EXP'
    };
    
    const prefix = prefixes[servicio] || 'TRK';
    const number = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${prefix}${number}`;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generar número de tracking automáticamente
      const trackingNumber = generateTrackingNumber(formData.servicio);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const shippingData = {
        ...formData,
        tracking: trackingNumber,
        fechaCreacion: new Date().toISOString()
      };
      
      onCreateShipping(pedido.id, shippingData);
      onClose();
    } catch (err) {
      setError('Error al crear el envío. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const servicioSeleccionado = serviciosEnvio.find(s => s.value === formData.servicio);
  const tipoEnvioSeleccionado = tiposEnvio.find(t => t.value === formData.tipoEnvio);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shipping-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="bi bi-truck"></i>
            Crear Envío
          </h2>
          <button className="btn-close" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="pedido-info">
            <h3>Pedido: {pedido.numero}</h3>
            <div className="info-grid">
              <div className="info-item">
                <i className="bi bi-person"></i>
                <span>{pedido.cliente.nombre}</span>
              </div>
              <div className="info-item">
                <i className="bi bi-currency-dollar"></i>
                <span>${pedido.total.toLocaleString()}</span>
              </div>
              {pedido.direccionEnvio && (
                <div className="info-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>
                    {pedido.direccionEnvio.ciudad}, {pedido.direccionEnvio.provincia}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="shipping-form">
              <div className="form-section">
                <h4>Configuración del Envío</h4>
                
                <div className="form-group">
                  <label>Servicio de Envío:</label>
                  <div className="servicios-grid">
                    {serviciosEnvio.map(servicio => (
                      <div 
                        key={servicio.value}
                        className={`servicio-option ${formData.servicio === servicio.value ? 'selected' : ''}`}
                        onClick={() => handleInputChange('servicio', servicio.value)}
                      >
                        <div className="servicio-header">
                          <strong>{servicio.label}</strong>
                          <span className="servicio-costo">${servicio.costo.toLocaleString()}</span>
                        </div>
                        <div className="servicio-tiempo">{servicio.tiempoEstimado}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Tipo de Entrega:</label>
                  <div className="tipos-envio">
                    {tiposEnvio.map(tipo => (
                      <label key={tipo.value} className="tipo-option">
                        <input
                          type="radio"
                          name="tipoEnvio"
                          value={tipo.value}
                          checked={formData.tipoEnvio === tipo.value}
                          onChange={(e) => handleInputChange('tipoEnvio', e.target.value)}
                        />
                        <div className="tipo-content">
                          <i className={`bi ${tipo.icon}`}></i>
                          <span>{tipo.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fechaEstimada">Fecha Estimada de Entrega:</label>
                    <input
                      id="fechaEstimada"
                      type="date"
                      value={formData.fechaEstimada}
                      onChange={(e) => handleInputChange('fechaEstimada', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="costo">Costo del Envío:</label>
                    <div className="input-with-currency">
                      <span className="currency">$</span>
                      <input
                        id="costo"
                        type="number"
                        value={formData.costo}
                        onChange={(e) => handleInputChange('costo', parseFloat(e.target.value) || '')}
                        placeholder="0"
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.seguro}
                      onChange={(e) => handleInputChange('seguro', e.target.checked)}
                    />
                    <span>Incluir seguro de envío (+$500)</span>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="observaciones">Observaciones:</label>
                  <textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder="Notas adicionales para el envío..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="shipping-confirmation">
              <h4>Confirmar Envío</h4>
              
              <div className="confirmation-details">
                <div className="detail-item">
                  <strong>Servicio:</strong> {servicioSeleccionado?.label}
                </div>
                <div className="detail-item">
                  <strong>Tipo:</strong> {tipoEnvioSeleccionado?.label}
                </div>
                <div className="detail-item">
                  <strong>Fecha estimada:</strong> {new Date(formData.fechaEstimada).toLocaleDateString('es-AR')}
                </div>
                <div className="detail-item">
                  <strong>Costo:</strong> ${formData.costo.toLocaleString()}
                  {formData.seguro && <span className="seguro-note"> (incluye seguro)</span>}
                </div>
                {formData.observaciones && (
                  <div className="detail-item">
                    <strong>Observaciones:</strong> {formData.observaciones}
                  </div>
                )}
              </div>

              <div className="tracking-preview">
                <div className="tracking-info">
                  <i className="bi bi-info-circle"></i>
                  <span>Se generará automáticamente un número de tracking</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={step === 1 ? onClose : () => setStep(1)}
            disabled={loading}
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          
          {step === 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const validationError = validateForm();
                if (validationError) {
                  setError(validationError);
                } else {
                  setError('');
                  setStep(2);
                }
              }}
            >
              Continuar
              <i className="bi bi-arrow-right"></i>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Creando envío...
                </>
              ) : (
                <>
                  <i className="bi bi-check"></i>
                  Crear Envío
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShippingModal;