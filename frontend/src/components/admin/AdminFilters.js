import React, { useState, useEffect } from 'react';
import '../styles/AdminFilters.css';

function AdminFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterByStock,
  onStockFilterChange,
  filterByPrice,
  onPriceFilterChange,
  filterByCategory,
  onCategoryFilterChange,
  attributeFilters,
  onAttributeFilterChange,
  viewMode,
  onViewModeChange,
  stats,
  availableCategories,
  availableAttributes,
  onShowAddItemForm
}) {
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);

  // Efecto para manejar el estado inicial basado en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowFilters(true); // En desktop siempre visible
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para obtener etiquetas más legibles para los atributos
  const getAttributeLabel = (attrName) => {
    const labels = {
      'tipo': 'Tipo',
      'material': 'Material',
      'materialInterno': 'Material Interno',
      'tamaño': 'Tamaño',
      'tamañoInterno': 'Tamaño Interno',
      'virola': 'Virola',
      'terminacion': 'Terminación',
      'grabado': 'Grabado',
      'descripcionDelGrabado': 'Descripción del Grabado',
      'base': 'Base',
      'color': 'Color'
    };
    return labels[attrName] || attrName.charAt(0).toUpperCase() + attrName.slice(1);
  };
  return (
    <div className="admin-filters">
      {/* Estadísticas principales */}
      <div className="stats-overview">
        <div 
          className={`stat-card clickable ${
            filterByStock === 'all' && 
            filterByPrice === 'all' && 
            searchTerm === '' ? 'active' : ''
          }`}
          onClick={() => {
            onStockFilterChange('all');
            onSearchChange('');
            onPriceFilterChange('all');
            onCategoryFilterChange('all');
            onAttributeFilterChange('reset');
          }}
          title="Mostrar todos los items"
        >
          <div className="stat-number">{stats?.total || 0}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div 
          className={`stat-card warning clickable ${filterByStock === 'low' ? 'active' : ''}`}
          onClick={() => {
            onStockFilterChange('low');
            onPriceFilterChange('all');
          }}
          title="Filtrar items con stock bajo (≤5)"
        >
          <div className="stat-number">{stats?.lowStock || 0}</div>
          <div className="stat-label">Stock Bajo</div>
        </div>
        <div 
          className={`stat-card danger clickable ${filterByStock === 'out' ? 'active' : ''}`}
          onClick={() => {
            onStockFilterChange('out');
            onPriceFilterChange('all');
          }}
          title="Filtrar items sin stock"
        >
          <div className="stat-number">{stats?.outOfStock || 0}</div>
          <div className="stat-label">Sin Stock</div>
        </div>
        <div 
          className="stat-card info clickable"
          onClick={() => {
            onSearchChange('');
            onStockFilterChange('all');
            onPriceFilterChange('all');
            onSortChange('categoria');
          }}
          title="Ordenar por categorías"
        >
          <div className="stat-number">{stats?.categories || 0}</div>
          <div className="stat-label">Categorías</div>
        </div>
      </div>

      {/* Botón para mostrar/ocultar filtros en móviles */}
      <div className="filters-toggle-container">
        <button 
          className="filters-toggle-btn"
          onClick={() => {
            // Solo permitir toggle en móviles
            if (window.innerWidth <= 768) {
              setShowFilters(!showFilters);
            }
          }}
        >
          <span>Filtros</span>
          <span className={`toggle-icon ${showFilters ? 'expanded' : 'collapsed'}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Controles de filtro */}
      <div className={`filters-controls ${showFilters ? 'expanded' : 'collapsed'}`}>
        {/* Búsqueda */}
        <div className="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Ordenamiento */}
        <div className="filter-group sort-group">
          <label>Ordenar por:</label>
          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
              <option value="nombre">Nombre</option>
              <option value="precioVenta">Precio</option>
              <option value="stock">Stock</option>
              <option value="categoria">Categoría</option>
            </select>
            <button 
              className={`sort-order-btn ${sortOrder}`}
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Filtro por stock */}
        <div className="filter-group">
          <label>Stock:</label>
          <select value={filterByStock} onChange={(e) => onStockFilterChange(e.target.value)}>
            <option value="all">Todos</option>
            <option value="low">Stock Bajo (≤5)</option>
            <option value="out">Sin Stock</option>
          </select>
        </div>

        {/* Filtro por precio */}
        <div className="filter-group">
          <label>Precio máximo:</label>
          <input
            type="number"
            min="0"
            step="100"
            value={filterByPrice === 'all' ? '' : filterByPrice}
            onChange={(e) => onPriceFilterChange(e.target.value === '' ? 'all' : e.target.value)}
            placeholder="Filtrar por precio..."
            className="price-filter-input"
          />
        </div>

        {/* Filtro por categoría */}
        <div className="filter-group">
          <label>Categoría:</label>
          <select 
            value={filterByCategory} 
            onChange={(e) => onCategoryFilterChange(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {availableCategories && availableCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Modo de vista */}
        <div className="filter-group">
          <label>Vista:</label>
          <div className="view-mode-buttons">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              📋
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              📝
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              📊
            </button>
            <button
              className="view-btn add-item-btn"
              onClick={onShowAddItemForm}
              title="Agregar nuevo item"
            >
              Agregar nuevo item
            </button>
          </div>
        </div>
      </div>

      {/* Filtros específicos por atributos (aparecen cuando se selecciona una categoría) */}
      {filterByCategory !== 'all' && availableAttributes && Object.keys(availableAttributes).length > 0 && (
        <div className={`attribute-filters ${showFilters ? 'expanded' : 'collapsed'}`}>
          <div className="attribute-filters-header">
            <h4>Filtros específicos de {availableCategories?.find(cat => cat.id === filterByCategory)?.nombre}</h4>
          </div>
          <div className="attribute-filters-controls">
            {Object.entries(availableAttributes).map(([attrName, values]) => (
              <div key={attrName} className="filter-group">
                <label>{getAttributeLabel(attrName)}:</label>
                <select 
                  value={attributeFilters[attrName] || 'all'}
                  onChange={(e) => onAttributeFilterChange(attrName, e.target.value)}
                >
                  <option value="all">Todos</option>
                  {values.map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFilters;