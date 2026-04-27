import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import catalogosData from '../../data/tiendas.json';
import '../styles/MobileFilters.css';

function MobileFilters({ 
  isOpen, 
  onClose, 
  catalogoItems, 
  currentItems, 
  currentCategory, 
  onFilter, 
  onSort 
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Función para obtener el número de productos de cada catálogo
  const getProductCount = (catalogName) => {
    const counts = {
      'Mates': 12,
      'Bombillas': 8,
      'Combos': 6
    };
    return counts[catalogName] || 0;
  };

  // Manejar búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      onFilter(catalogoItems);
    } else {
      const filtered = catalogoItems.filter(item =>
        item.nombre.toLowerCase().includes(term.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(term.toLowerCase())
      );
      onFilter(filtered);
    }
  };

  // Manejar ordenamiento
  const handleSort = (option) => {
    setSortOption(option);
    let sortedItems = [...currentItems];
    
    switch (option) {
      case 'price-asc':
        sortedItems.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-desc':
        sortedItems.sort((a, b) => b.precio - a.precio);
        break;
      case 'name-asc':
        sortedItems.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name-desc':
        sortedItems.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        break;
    }
    
    onSort(sortedItems);
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (catalogo) => {
    navigate(catalogo.url);
    onClose();
  };

  // Cerrar al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSortOption('');
    onFilter(catalogoItems);
  };

  // Prevenir scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-filters-overlay" onClick={handleOverlayClick}>
      <div className="mobile-filters-sidebar">
        {/* Header */}
        <div className="mobile-filters-header">
          <h3>Filtros y Ordenar</h3>
          <button 
            className="mobile-filters-close"
            onClick={onClose}
            aria-label="Cerrar filtros"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="mobile-filters-content">
          {/* Buscador */}
          <div className="mobile-filter-section">
            <label className="mobile-filter-label">Buscar productos</label>
            <input
              type="text"
              className="mobile-filter-input"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Categorías */}
          <div className="mobile-filter-section">
            <label className="mobile-filter-label">Cambiar categoría</label>
            <div className="mobile-categories">
              {catalogosData.catalogos.map((catalogo, idx) => {
                const isActive = catalogo.nombre === currentCategory;
                const productCount = getProductCount(catalogo.nombre);
                
                return (
                  <button
                    key={idx}
                    className={`mobile-category-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(catalogo)}
                    disabled={isActive}
                  >
                    <span className="category-name">{catalogo.nombre}</span>
                    {productCount > 0 && (
                      <span className="category-count">{productCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="mobile-filter-section">
            <label className="mobile-filter-label">Ordenar por</label>
            <select
              className="mobile-filter-select"
              value={sortOption}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="">Orden por defecto</option>
              <option value="price-asc">Precio: Menor a mayor</option>
              <option value="price-desc">Precio: Mayor a menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="mobile-filters-footer">
          <button 
            className="mobile-filter-clear"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
          <button 
            className="mobile-filter-apply"
            onClick={onClose}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFilters;