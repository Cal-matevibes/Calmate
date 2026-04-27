import React from 'react';
import '../styles/SectionDividerImage.css';

function SectionDividerImage({ src, alt = '', height = '120px' }) {
  // Crear múltiples copias para el efecto infinito
  const images = Array(8).fill(null).map((_, index) => (
    <img key={index} src={src} alt={alt} className="section-divider-image" />
  ));

  return (
    <div className="section-divider-container" style={{ height }}>
      <div className="section-divider-wrapper">
        {images}
      </div>
    </div>
  );
}

export default SectionDividerImage;