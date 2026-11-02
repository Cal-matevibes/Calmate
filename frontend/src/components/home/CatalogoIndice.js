import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import categoriaService from '../../services/categoriaService';
import '../styles/CatalogoIndice.css';

function CatalogoIndice() {
  const { catalogoId } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    categoriaService.obtenerCategorias()
      .then((response) => {
        if (active) {
          setCategorias(response.data || response.categorias || []);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message || 'No se pudieron cargar las categorías.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="catalogo-indice">
      <h3 className="catalogo-indice-title">
        Explorar Categorías
      </h3>
      <ul className="catalogo-indice-list">
        {categorias.map((catalogo) => {
          const slug = catalogo.slug || catalogo.nombre.toLowerCase();
          const isActive = catalogoId === slug;
          const productCount = catalogo.estadisticas?.totalProductos || 0;
          
          return (
            <li
              key={catalogo._id || slug}
              className={`catalogo-indice-item ${isActive ? 'active' : ''}`}
            >
              <Link to={`/catalogo/${slug}`} className="catalogo-indice-link">
                <span className="catalogo-name">{catalogo.nombre}</span>
                {productCount > 0 && (
                  <span className="catalogo-indice-count">{productCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      {loadError && <p role="status">{loadError}</p>}
    </div>
  );
}

export default CatalogoIndice;