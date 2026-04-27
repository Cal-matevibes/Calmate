import React from 'react';
import { Link } from 'react-router-dom';
import './styles/TiendaCard.css';

function TiendaCard({ nombre, imagen, url}) {
  return (
    <Link to={url} className="tienda-card" style={{ backgroundImage: `url(${imagen})` }}>
      <div className="tienda-card-overlay">
        <h3>{nombre}</h3>
      </div>
    </Link>
  );
}

export default TiendaCard;