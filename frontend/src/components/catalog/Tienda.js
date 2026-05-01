import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoriaService from '../../services/categoriaService';
import '../styles/Tienda.css';
import Loading from '../shared/Loading';

function Tienda() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar categorías desde la base de datos
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriaService.obtenerCategorias({
        incluirInactivas: 'false' // Solo categorías activas
      });

      if (response.success) {
        setCategorias(response.data);
      } else {
        setError(response.message || 'Error al cargar las categorías');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias();
  }, []);

  // Función para generar la URL del catálogo
  const getCatalogUrl = (categoriaNombre) => {
    // Convertir a lowercase y reemplazar espacios por guiones para URLs limpias
    return `/catalog/${categoriaNombre.toLowerCase().replace(/\s+/g, '-')}`;
  };

  if (loading) {
    return (
      <div className="tienda">
          <Loading text="Cargando categorías..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tienda">
        <div className="error-container">
          <h2>Error al cargar</h2>
          <p>{error}</p>
          <button onClick={fetchCategorias} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tienda">
      <div className="catalogo-header">
        <h2>Nuestro catálogo</h2>
      </div>
      <div className="catalogos">
        {categorias.map((categoria) => (
          <Link
            to={getCatalogUrl(categoria.nombre)}
            className="catalogo-card"
            key={categoria._id}
            style={categoria.imagen?.url ? {
              backgroundImage: `url(${categoria.imagen.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : {
              background: 'linear-gradient(45deg, rgba(183, 199, 116, 0.2), rgba(82, 105, 26, 0.2))'
            }}
          >
            <h3>{categoria.nombre}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Tienda;