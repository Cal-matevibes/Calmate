import React from 'react';
import '../styles/Popup.css';

function Popup({ title, description, onConfirm, onCancel }) {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999
  };

  const containerStyle = {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    zIndex: 999999,
    position: 'relative'
  };

  return (
    <div className="popup-overlay" style={overlayStyle}>
      <div className="popup-container" style={containerStyle}>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-description">{description}</p>
        <div className="popup-buttons">
          <button className="popup-button confirm" onClick={onConfirm}>
            Confirmar
          </button>
          <button className="popup-button cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;