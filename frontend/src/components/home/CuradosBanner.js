import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CuradosBanner.css';

function CuradosBanner({ title, text, imageUrl, backgroundSize = '40%' }) {
  const navigate = useNavigate();

  const formatText = (text) => {
    return text.replace(/(M)(ate)/gi, '<span class="special-m">m</span><span class="special-rest">ate</span>');
  };

  const handleViewMore = () => {
    navigate('/care'); // Redirige a la página de "Cuidados"
  };

  return (
    <div 
      className="curados-banner" 
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: backgroundSize
      }}
    >
      <div className="curados-content">
        <div className="curados-title" dangerouslySetInnerHTML={{ __html: formatText(title) }}></div>
        <div className="curados-text">{text}</div>
        <button className="curados-button" onClick={handleViewMore}>
          Ver más
        </button>
      </div>
    </div>
  );
}

export default CuradosBanner;