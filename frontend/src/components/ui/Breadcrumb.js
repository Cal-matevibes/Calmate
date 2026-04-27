import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Breadcrumb.css';

function Breadcrumb() {
  const location = useLocation();

  // Divide la ruta actual en segmentos
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Función para capitalizar la primera letra
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <nav className="breadcrumb">
      <ul className="breadcrumb-list">
        {/* Enlace a la página principal */}
        <li className="breadcrumb-item">
          <Link to="/">Inicio</Link>
        </li>

        {/* Genera enlaces dinámicos para cada segmento */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <React.Fragment key={to}>
              <span className="breadcrumb-separator">{'>'}</span>
              <li className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
                {isLast ? (
                  <span>{capitalize(value)}</span>
                ) : (
                  <Link to={to}>{capitalize(value)}</Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
}

export default Breadcrumb;