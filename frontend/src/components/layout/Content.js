import React from 'react';
import '../styles/Content.css';

function Content({
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
  // const gradient = `linear-gradient(to bottom, ${color1} 100%, ${color2} 100%)`; // Commented out - not currently used
  const textColor = colorLead;
  const titleColor = colorTitle;

  return (
    <div
      className="content-hero"
      // style={{ background: gradient }}
    >
      <div className="content-hero-inner">
        <div className="content-hero-content">
          <h2 className="display-5" style={{ color: titleColor }}>{title}</h2>
          <div className="lead" style={{ color: textColor }}>{lead}</div>
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

export default Content;