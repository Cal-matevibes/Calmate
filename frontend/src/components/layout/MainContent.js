import React from 'react';
import './styles/MainContent.css';

function MainContent({
  title,
  lead,
  children,
  buttonText,
  buttonLink,
  color1 = '#52691a',
  color2 = '#b7c774',
  colorLead = '#ffffffff',
  colorTitle = '#ffffffff',
  image, // Nueva prop para la imagen
  imageAlt = '', // Texto alternativo opcional
}) {
  const gradient = `linear-gradient(to bottom, ${color1} 100%, ${color2} 100%)`;
  const textColor = colorLead;
  const titleColor = colorTitle;

  return (
    <div
      className="content-main-hero"
    >
      <div className="content-main-hero-inner" style={{ background: gradient }}>
        <div className="content-main-hero-content">
          <h1 className="display-5" style={{ color: titleColor }}>{title}</h1>
          <p className="lead" style={{ color: textColor }}>{lead}</p>
          {children}
          {buttonText && buttonLink && (
            <a className="btn btn-primary btn-lg" href={buttonLink} role="button">
              {buttonText}
            </a>
          )}
        </div>
        {image && (
          <img
            src={image}
            alt={imageAlt}
            className="content-image"
          />
        )}
      </div>
    </div>
  );
}

export default MainContent;