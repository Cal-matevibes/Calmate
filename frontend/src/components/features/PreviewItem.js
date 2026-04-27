import React, { useState } from 'react';
import '../styles/PreviewItem.css';

function PreviewItem({ item, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Estado para la imagen activa

  if (!item) return null; // Si no hay item, no renderiza nada

  // Helper para obtener todas las imágenes disponibles
  const getItemImages = () => {
    const images = [];
    
    if (item.imagenes && item.imagenes.length > 0) {
      images.push(...item.imagenes);
    } else {
      if (item.imagen) images.push(item.imagen);
      if (item.imagenHover && item.imagenHover !== item.imagen) {
        images.push(item.imagenHover);
      }
    }
    
    return images.length > 0 ? images : ['/placeholder.svg'];
  };

  const images = getItemImages();

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

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

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
    maxWidth: '400px',
    width: '90%',
    overflow: 'hidden',
    position: 'relative',
    textAlign: 'center',
    zIndex: 999999
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    zIndex: 999999
  };

  return (
    <div className="preview-overlay" style={overlayStyle}>
      <div className="preview-card" style={cardStyle}>
        <button className="preview-close-button" style={closeButtonStyle} onClick={onClose}>
          <i className="fas fa-times"></i> {/* Ícono de cerrar */}
        </button>
        <div className="preview-image-container">
          {images.length > 1 && (
            <button className="preview-nav-button prev" onClick={handlePrevImage}>
              <i className="fas fa-chevron-left"></i>
            </button>
          )}
          <img
            src={images[currentImageIndex]}
            alt={`Preview ${currentImageIndex}`}
            className="preview-image"
            onError={(e) => {
              e.target.src = '/placeholder.svg';
            }}
          />
          {images.length > 1 && (
            <button className="preview-nav-button next" onClick={handleNextImage}>
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>
        <div className="preview-info">
          <h3 className="preview-title">{item.nombre}</h3>
          {item.categoria && (
            <span className="preview-category">📂 {item.categoria}</span>
          )}
          <p className="preview-price">
            💰 {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS'
            }).format(item.precioVenta)}
          </p>
          <p className={`preview-stock ${item.stock === 0 ? 'out-of-stock' : item.stock <= 5 ? 'low-stock' : 'in-stock'}`}>
            📦 Stock: {item.stock}
            {item.stock === 0 && ' (Sin stock)'}
            {item.stock > 0 && item.stock <= 5 && ' (Stock bajo)'}
          </p>
          <p className="preview-description">{item.descripcion}</p>
          {images.length > 1 && (
            <div className="preview-image-counter">
              📸 Imagen {currentImageIndex + 1} de {images.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewItem;