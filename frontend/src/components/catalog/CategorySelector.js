import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoriaService from '../../services/categoriaService';
import productoService from '../../services/productoService';
import fallbackData from '../../data/tiendas.json';
import '../styles/CategorySelector.css';
import Loading from '../shared/Loading';

function CategorySelector({ currentCategory }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Cargar categorías desde la base de datos
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoading(true);

        // Obtener todas las categorías
        const categoriasData = await categoriaService.obtenerCategorias();

        // Manejar diferentes estructuras de respuesta
        const categoriasArray = categoriasData.categorias || categoriasData.data || categoriasData || [];

        setCategorias(categoriasArray);

        // Verificar que tenemos categorías válidas
        if (categoriasArray.length === 0) {
          console.warn('⚠️ No se encontraron categorías en la respuesta');
          return;
        }

        setUsingFallback(false);

        // Contar productos por categoría de manera eficiente
        const counts = {};

        // Hacer todas las peticiones en paralelo para mejor rendimiento
        const conteoPromises = categoriasArray.map(async (categoria) => {
          try {
            const productos = await productoService.obtenerProductosPorCategoria(categoria.slug);
            return { nombre: categoria.nombre, count: productos.productos?.length || 0 };
          } catch (error) {
            console.error(`Error contando productos para ${categoria.nombre}:`, error);
            return { nombre: categoria.nombre, count: 0 };
          }
        });

        const conteoResults = await Promise.all(conteoPromises);
        conteoResults.forEach(({ nombre, count }) => {
          counts[nombre] = count;
        });

        setProductCounts(counts);
      } catch (error) {

        try {
          // Usar datos de respaldo si el backend no está disponible
          const fallbackCategorias = fallbackData.catalogos.map(cat => ({
            _id: cat.nombre.toLowerCase(),
            nombre: cat.nombre,
            slug: cat.nombre.toLowerCase(),
            url: cat.url, // Incluir la URL estática para navegación de fallback
            imagen: { url: cat.imagen },
            descripcion: `Categoría ${cat.nombre}`
          }));

          setCategorias(fallbackCategorias);

          // Establecer conteos estáticos para el fallback
          const fallbackCounts = {
            'Mates': 12,
            'Bombillas': 8,
            'Combos': 6
          };
          setProductCounts(fallbackCounts);

          setUsingFallback(true);
        } catch (fallbackError) {
          console.error('❌ Error cargando datos de respaldo:', fallbackError);
          setCategorias([]);
          setProductCounts({});
          setUsingFallback(false);
        }
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, []);

  // Función para obtener el número de productos de cada categoría
  const getProductCount = (categoryName) => {
    return productCounts[categoryName] || 0;
  };

  const handleCategoryChange = (categoria) => {
    setIsOpen(false);

    if (usingFallback && categoria.url) {
      // Si estamos usando fallback, usar URLs estáticas directamente
      navigate(categoria.url);
    } else if (categoria.slug) {
      // Navegar usando el slug de la categoría (dinámico)
      navigate(`/catalogo/${categoria.slug}`);
    } else if (categoria.nombre) {
      // Si no hay slug, crear uno desde el nombre
      const slugFromName = categoria.nombre.toLowerCase();
      navigate(`/catalogo/${slugFromName}`);
    } else {
      // Opción "Ver todos" - ir al catálogo completo
      navigate(`/catalog`);
    }
  };

  const handleShowAll = () => {
    setIsOpen(false);
    navigate('/catalog');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // const currentCatalog = catalogosData.catalogos.find(cat => 
  //   cat.nombre === currentCategory
  // ); // Commented out - not currently used

  return (
    <div className="category-selector">
      <button
        className="category-selector-button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="category-selector-label">Categoría:</span>
        <span className="category-selector-current">
          {currentCategory}
          {getProductCount(currentCategory) > 0 && (
            <span className="category-count">({getProductCount(currentCategory)})</span>
          )}
        </span>
        <svg
          className={`category-selector-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="category-selector-dropdown">
          <ul className="category-selector-list" role="listbox">
            {loading ? (
              <li className="category-selector-loading">
                <Loading text="Cargando categorías..." />
              </li>
            ) : categorias.length === 0 ? (
              <li className="category-selector-empty">
                <span>No hay categorías disponibles</span>
              </li>
            ) : (
              <>
                {/* Opción "Ver todos" */}
                <li role="option" aria-selected={!currentCategory || currentCategory === 'Todos'}>
                  <button
                    className={`category-selector-option ${(!currentCategory || currentCategory === 'Todos') ? 'active' : ''}`}
                    onClick={handleShowAll}
                    disabled={!currentCategory || currentCategory === 'Todos'}
                  >
                    <span className="category-option-name">Ver todos</span>
                  </button>
                </li>

                {/* Separador visual */}
                <li className="category-selector-divider"></li>

                {/* Categorías dinámicas */}
                {categorias.map((categoria) => {
                  const isActive = categoria.nombre === currentCategory;
                  const productCount = getProductCount(categoria.nombre);

                  return (
                    <li key={categoria._id || categoria.id || categoria.nombre} role="option" aria-selected={isActive}>
                      <button
                        className={`category-selector-option ${isActive ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(categoria)}
                        disabled={isActive}
                      >
                        <span className="category-option-name">{categoria.nombre}</span>
                        {productCount > 0 && (
                          <span className="category-option-count">{productCount}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </div>
      )}

      {/* Overlay para cerrar el dropdown al hacer clic fuera */}
      {isOpen && (
        <div
          className="category-selector-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default CategorySelector;