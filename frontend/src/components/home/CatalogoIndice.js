import React from 'react';
import { Link, useParams } from 'react-router-dom';
import catalogosData from '../data/tiendas.json'; // Carga el JSON de la tienda con los catálogos
import '../styles/CatalogoIndice.css';

function CatalogoIndice() {
  const { catalogoId } = useParams(); // Obtiene el ID del catálogo actual desde la URL

  // Función para obtener el número de productos de cada catálogo (simulado)
  const getProductCount = (catalogName) => {
    const counts = {
      'Mates': 12,
      'Bombillas': 8,
      'Combos': 6
    };
    return counts[catalogName] || 0;
  };

  return (
    <div className="catalogo-indice">
      <h3 className="catalogo-indice-title">
        Explorar Categorías
      </h3>
      <ul className="catalogo-indice-list">
        {catalogosData.catalogos.map((catalogo, idx) => {
          const isActive = catalogoId === catalogo.url.split('/').pop();
          const productCount = getProductCount(catalogo.nombre);
          
          return (
            <li
              key={idx}
              className={`catalogo-indice-item ${isActive ? 'active' : ''}`}
            >
              <Link to={catalogo.url} className="catalogo-indice-link">
                <span className="catalogo-name">{catalogo.nombre}</span>
                {productCount > 0 && (
                  <span className="catalogo-indice-count">{productCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CatalogoIndice;