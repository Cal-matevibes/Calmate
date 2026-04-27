import React, { useState } from 'react';
import '../styles/VentasFilters.css';

function VentasFilters({
  dateRange,
  customDateRange,
  productFilter,
  statusFilter,
  searchTerm,
  onDateRangeChange,
  onProductFilterChange,
  onStatusFilterChange,
  onSearchChange,
  totalResults
}) {
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const handleDateRangeChange = (range) => {
    if (range === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      onDateRangeChange(range);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.start && customDateRange.end) {
      onDateRangeChange('custom', customDateRange);
      setShowCustomDatePicker(false);
    }
  };

  const resetFilters = () => {
    onDateRangeChange('30days');
    onProductFilterChange('all');
    onStatusFilterChange('all');
    onSearchChange('');
    setShowCustomDatePicker(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange !== '30days') count++;
    if (productFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (searchTerm) count++;
    return count;
  };

  return (
    <div className="ventas-filters">
      {/* Resumen de resultados */}
      <div className="filters-summary">
        <div className="results-info">
          <span className="results-count">{totalResults}</span>
          <span className="results-label">registros encontrados</span>
          {getActiveFiltersCount() > 0 && (
            <span className="active-filters">
              ({getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} activo{getActiveFiltersCount() > 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className="filters-actions">
          {getActiveFiltersCount() > 0 && (
            <button className="btn-reset-filters" onClick={resetFilters}>
              🔄 Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Botón toggle para móviles */}
      <div className="filters-toggle-container">
        <button 
          className="filters-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span>Filtros de Ventas</span>
          <span className={`toggle-icon ${showFilters ? 'expanded' : 'collapsed'}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Controles de filtro */}
      <div className={`filters-controls ${showFilters ? 'expanded' : 'collapsed'}`}>
        {/* Búsqueda */}
        <div className="filter-group">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Buscar por producto, categoría o ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Rango de fechas */}
        <div className="filter-group">
          <label>📅 Período:</label>
          <select 
            value={dateRange} 
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="date-range-select"
          >
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
            <option value="custom">Rango personalizado</option>
            <option value="all">Todos los registros</option>
          </select>
        </div>

        {/* Selector de fechas personalizado */}
        {showCustomDatePicker && (
          <div className="custom-date-picker">
            <div className="date-inputs">
              <div className="date-input-group">
                <label>Desde:</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => onDateRangeChange('custom', {
                    ...customDateRange,
                    start: e.target.value
                  })}
                />
              </div>
              <div className="date-input-group">
                <label>Hasta:</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => onDateRangeChange('custom', {
                    ...customDateRange,
                    end: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="date-actions">
              <button 
                className="btn-apply-dates"
                onClick={handleCustomDateSubmit}
                disabled={!customDateRange.start || !customDateRange.end}
              >
                Aplicar
              </button>
              <button 
                className="btn-cancel-dates"
                onClick={() => {
                  setShowCustomDatePicker(false);
                  onDateRangeChange('30days');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtro por tipo de producto/rendimiento */}
        <div className="filter-group">
          <label>📈 Rendimiento:</label>
          <select 
            value={productFilter} 
            onChange={(e) => onProductFilterChange(e.target.value)}
          >
            <option value="all">Todos los productos</option>
            <option value="top-sellers">Más vendidos</option>
            <option value="low-performers">Bajo rendimiento</option>
            <option value="high-margin">Mayor margen</option>
            <option value="most-accessed">Más accedidos</option>
          </select>
        </div>

        {/* Filtro por estado */}
        <div className="filter-group">
          <label>📋 Estado:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="normal">✅ Normales</option>
            <option value="defectuoso">⚠️ Defectuosos</option>
            <option value="devuelto">↩️ Devueltos</option>
          </select>
        </div>

        {/* Filtros rápidos */}
        <div className="filter-group quick-filters">
          <label>⚡ Filtros Rápidos:</label>
          <div className="quick-filter-buttons">
            <button 
              className={`quick-filter-btn ${statusFilter === 'defectuoso' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange(statusFilter === 'defectuoso' ? 'all' : 'defectuoso')}
            >
              ⚠️ Defectuosos
            </button>
            <button 
              className={`quick-filter-btn ${statusFilter === 'devuelto' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange(statusFilter === 'devuelto' ? 'all' : 'devuelto')}
            >
              ↩️ Devueltos
            </button>
            <button 
              className={`quick-filter-btn ${productFilter === 'top-sellers' ? 'active' : ''}`}
              onClick={() => onProductFilterChange(productFilter === 'top-sellers' ? 'all' : 'top-sellers')}
            >
              🏆 Más Vendidos
            </button>
            <button 
              className={`quick-filter-btn ${productFilter === 'most-accessed' ? 'active' : ''}`}
              onClick={() => onProductFilterChange(productFilter === 'most-accessed' ? 'all' : 'most-accessed')}
            >
              👁️ Más Vistos
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {getActiveFiltersCount() > 0 && (
        <div className="active-filters-display">
          <span className="active-filters-label">Filtros activos:</span>
          <div className="active-filters-tags">
            {dateRange !== '30days' && (
              <span className="filter-tag">
                📅 {dateRange === 'custom' ? 'Personalizado' : 
                     dateRange === '7days' ? '7 días' :
                     dateRange === '90days' ? '90 días' : 'Todos'}
                <button onClick={() => onDateRangeChange('30days')}>×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="filter-tag">
                📋 {statusFilter === 'normal' ? 'Normales' :
                     statusFilter === 'defectuoso' ? 'Defectuosos' : 'Devueltos'}
                <button onClick={() => onStatusFilterChange('all')}>×</button>
              </span>
            )}
            {productFilter !== 'all' && (
              <span className="filter-tag">
                📈 {productFilter === 'top-sellers' ? 'Más vendidos' :
                     productFilter === 'low-performers' ? 'Bajo rendimiento' :
                     productFilter === 'high-margin' ? 'Mayor margen' : 'Más accedidos'}
                <button onClick={() => onProductFilterChange('all')}>×</button>
              </span>
            )}
            {searchTerm && (
              <span className="filter-tag">
                🔍 "{searchTerm}"
                <button onClick={() => onSearchChange('')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VentasFilters;