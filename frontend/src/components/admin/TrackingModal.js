import React, { useState } from 'react';
import './styles/TrackingModal.css';

function TrackingModal({ pedido, onClose, onTrackingUpdate }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [correo, setCorreo] = useState('correo-argentino');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const correoOptions = [
    { value: 'correo-argentino', label: 'Correo Argentino', prefix: 'AR' },
    { value: 'oca', label: 'OCA', prefix: 'OCA' },
    { value: 'andreani', label: 'Andreani', prefix: 'AND' },
    { value: 'mercado-envios', label: 'Mercado Envíos', prefix: 'ME' },
    { value: 'urbano', label: 'Urbano Express', prefix: 'URB' },
    { value: 'otro', label: 'Otro', prefix: '' }
  ];

  const generateTrackingNumber = () => {
    const selectedCorreo = correoOptions.find(c => c.value === correo);
    const prefix = selectedCorreo?.prefix || '';
    const randomNum = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const generated = prefix ? `${prefix}${randomNum}` : randomNum;
    setTrackingNumber(generated);
  };

  const validateTrackingNumber = (number) => {
    if (!number.trim()) {
      return 'El número de tracking es requerido';
    }
    if (number.length < 6) {
      return 'El número de tracking debe tener al menos 6 caracteres';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateTrackingNumber(trackingNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onTrackingUpdate(pedido.id, trackingNumber);
      onClose();
    } catch (err) {
      setError('Error al actualizar el tracking. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTrackingUrl = (correoValue, trackingNum) => {
    const urls = {
      'correo-argentino': `https://www.correoargentino.com.ar/formularios/ondep?codigo=${trackingNum}`,
      'oca': `https://www1.oca.com.ar/OcaEpak_Tracking/Tracking.aspx?numero=${trackingNum}`,
      'andreani': `https://www.andreani.com/seguimiento?numero=${trackingNum}`,
      'mercado-envios': `https://www.mercadolibre.com.ar/ayuda/seguimiento_${trackingNum}`,
      'urbano': `https://urbano.com.ar/seguimiento/${trackingNum}`
    };
    return urls[correoValue] || '#';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tracking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="bi bi-geo-alt-fill"></i>
            Agregar Número de Tracking
          </h2>
          <button className="btn-close" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="pedido-info">
            <h3>Pedido: {pedido.numero}</h3>
            <p>Cliente: {pedido.cliente.nombre}</p>
            {pedido.direccionEnvio && (
              <p className="direccion">
                <i className="bi bi-geo-alt"></i>
                {pedido.direccionEnvio.ciudad}, {pedido.direccionEnvio.provincia}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="tracking-form">
            {error && (
              <div className="error-message">
                <i className="bi bi-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="correo">Servicio de Envío:</label>
              <select
                id="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="form-select"
              >
                {correoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="trackingNumber">Número de Tracking:</label>
              <div className="tracking-input-group">
                <input
                  id="trackingNumber"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="Ingresa el número de tracking"
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-generate"
                  onClick={generateTrackingNumber}
                  disabled={loading}
                  title="Generar número de tracking automático"
                >
                  <i className="bi bi-dice-3"></i>
                </button>
              </div>
              <small className="form-help">
                Puedes ingresar manualmente o generar uno automático
              </small>
            </div>

            {trackingNumber && correo !== 'otro' && (
              <div className="tracking-preview">
                <h4>Vista Previa del Tracking:</h4>
                <div className="preview-item">
                  <strong>Número:</strong> {trackingNumber}
                </div>
                <div className="preview-item">
                  <strong>Servicio:</strong> {correoOptions.find(c => c.value === correo)?.label}
                </div>
                <div className="preview-item">
                  <strong>URL de seguimiento:</strong>
                  <a 
                    href={getTrackingUrl(correo, trackingNumber)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="tracking-link"
                  >
                    Ver en sitio del correo
                    <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !trackingNumber.trim()}
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise spin"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check"></i>
                Guardar Tracking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrackingModal;