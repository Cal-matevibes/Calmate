import React, { useState } from 'react';
import './styles/PedidosFilters.css';

function PedidosFilters({ filters, onFilterChange, totalPedidos }) {
    const [isDateRangeExpanded, setIsDateRangeExpanded] = useState(false);
    const handleFilterChange = (key, value) => {
        onFilterChange({
            ...filters,
            [key]: value
        });
    };

    const clearFilters = () => {
        onFilterChange({
            estado: 'todos',
            fechaDesde: '',
            fechaHasta: '',
            busqueda: ''
        });
    };

    const estadosOptions = [
        { value: 'todos', label: 'Todos los estados', count: null },
        { value: 'pendiente', label: 'Pendientes', count: null },
        { value: 'procesando', label: 'Procesando', count: null },
        { value: 'enviado', label: 'Enviados', count: null },
        { value: 'entregado', label: 'Entregados', count: null },
        { value: 'cancelado', label: 'Cancelados', count: null }
    ];

    return (
        <div className="pedidos-filters">
            <div className="filters-header">
                <h3>Filtros</h3>
                <span className="total-count">{totalPedidos} pedidos</span>
            </div>

            {/* Búsqueda */}
            <div className="filter-group">
                <label htmlFor="busqueda" className="filter-label">
                    <i className="bi bi-search"></i>
                    Buscar pedido
                </label>
                <input
                    id="busqueda"
                    type="text"
                    className="filter-input"
                    placeholder="Número, cliente o email..."
                    value={filters.busqueda}
                    onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                />
            </div>

            {/* Estado */}
            <div className="filter-group">
                <label htmlFor="estado-select" className="filter-label">
                    <i className="bi bi-funnel"></i>
                    Estado del pedido
                </label>
                <select
                    id="estado-select"
                    className="filter-select"
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                    {estadosOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Rango de fechas */}
            <div className="filter-group">
                <button 
                    className="filter-label expandable-label"
                    onClick={() => setIsDateRangeExpanded(!isDateRangeExpanded)}
                    type="button"
                >
                    <i className="bi bi-calendar-range"></i>
                    Rango de fechas
                    <i className={`bi ${isDateRangeExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </button>
                {isDateRangeExpanded && (
                    <div className="date-range expandable-content">
                    <div className="date-input-group">
                        <label htmlFor="fechaDesde" className="date-label">Desde:</label>
                        <input
                            id="fechaDesde"
                            type="date"
                            className="filter-input date-input"
                            value={filters.fechaDesde}
                            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                        />
                    </div>
                    <div className="date-input-group">
                        <label htmlFor="fechaHasta" className="date-label">Hasta:</label>
                        <input
                            id="fechaHasta"
                            type="date"
                            className="filter-input date-input"
                            value={filters.fechaHasta}
                            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                        />
                    </div>
                    </div>
                )}
            </div>

            {/* Botón limpiar filtros */}
            <div className="filter-actions">
                <button
                    type="button"
                    className="btn btn-clear-filters"
                    onClick={clearFilters}
                >
                    <i className="bi bi-x-circle"></i>
                    Limpiar filtros
                </button>
            </div>
        </div>
    );
}

export default PedidosFilters;