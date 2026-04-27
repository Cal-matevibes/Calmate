import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroSection.css';

function FullImage({ src, alt = '', background }) {
  const navigate = useNavigate();

  const handleCatalogClick = () => {
    navigate('/catalogo');
  };

  const formatText = (text) => {
    return text.replace(/(M)(ates?)/gi, '<span class="special-m">m</span><span class="special-rest">$2</span>');
  };

  return (
    <div className="hero-welcome-container">
      <div className="hero-content">
        {/* Claim section - Left side */}
        <div className="hero-claim">
          <h1 
            className="hero-title"
            dangerouslySetInnerHTML={{
              __html: `Tu <span class="hero-accent">${formatText('mate')}</span> perfecto `
            }}
          />
          <p 
            className="hero-description"
            dangerouslySetInnerHTML={{
              __html: formatText('Descubre nuestra colección de mates artesanales y bombillas únicas. Cada pieza cuenta una historia y es ideal para crear momentos especiales.')
            }}
          />
        </div>

        {/* Image section - Right side */}
        <div className="hero-image-section">
          <div className="hero-circular-container">
            {/* <div className="hero-circular-image"> */}
              <img src={src} alt={alt} className="hero-main-image" />
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullImage;