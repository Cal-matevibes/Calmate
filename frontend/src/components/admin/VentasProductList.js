import React, { useState } from 'react';
import '../styles/VentasProductList.css';

function VentasProductList({
  products,
  onProductClick,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) {
  const [sortBy, setSortBy] = useState('fechaVenta');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      normal: { icon: '✅', label: 'Normal', class: 'status-normal' },
      defectuoso: { icon: '⚠️', label: 'Defectuoso', class: 'status-defective' },
      devuelto: { icon: '↩️', label: 'Devuelto', class: 'status-returned' }
    };
    
    const config = statusConfig[status] || statusConfig.normal;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getMarginPercentage = (precioCompra, precioVenta) => {
    if (precioVenta === 0) return 0;
    return (((precioVenta - precioCompra) / precioVenta) * 100).toFixed(1);
  };

  const getMarginClass = (precioCompra, precioVenta) => {
    const percentage = getMarginPercentage(precioCompra, precioVenta);
    if (percentage >= 30) return 'margin-high';
    if (percentage >= 15) return 'margin-medium';
    return 'margin-low';
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botón anterior
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
        >
          ←
        </button>
      );
    }

    // Primera página si no está visible
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Última página si no está visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Botón siguiente
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
        >
          →
        </button>
      );
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="ventas-product-list">
      {/* Header de la lista */}
      <div className="list-header">
        <div className="list-title-section">
          <h3>📋 Lista de Productos Vendidos</h3>
          <div className="list-info">
            Mostrando {startItem}-{endItem} de {totalItems} registros
          </div>
        </div>
        
        <div className="list-controls">
          <div className="view-mode-controls">
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vista de tabla"
            >
              📊
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Vista de tarjetas"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Vista de tabla */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('nombreProducto')} className="sortable">
                  Producto {getSortIcon('nombreProducto')}
                </th>
                <th onClick={() => handleSort('categoria')} className="sortable">
                  Categoría {getSortIcon('categoria')}
                </th>
                <th onClick={() => handleSort('cantidadVendida')} className="sortable">
                  Cant. Vendida {getSortIcon('cantidadVendida')}
                </th>
                <th onClick={() => handleSort('precioCompra')} className="sortable">
                  Precio Compra {getSortIcon('precioCompra')}
                </th>
                <th onClick={() => handleSort('precioVenta')} className="sortable">
                  Precio Venta {getSortIcon('precioVenta')}
                </th>
                <th onClick={() => handleSort('margenGanancia')} className="sortable">
                  Margen {getSortIcon('margenGanancia')}
                </th>
                <th onClick={() => handleSort('fechaVenta')} className="sortable">
                  Fecha {getSortIcon('fechaVenta')}
                </th>
                <th onClick={() => handleSort('estado')} className="sortable">
                  Estado {getSortIcon('estado')}
                </th>
                <th onClick={() => handleSort('accesos')} className="sortable">
                  Accesos {getSortIcon('accesos')}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className="product-row"
                  onClick={() => onProductClick(product)}
                >
                  <td className="product-name">
                    <div className="product-name-container">
                      <strong>{product.nombreProducto}</strong>
                      <small className="product-id">ID: {product.productoId}</small>
                    </div>
                  </td>
                  <td className="product-category">
                    <span className="category-tag">{product.categoria}</span>
                  </td>
                  <td className="quantity">
                    <span className="quantity-badge">{product.cantidadVendida}</span>
                  </td>
                  <td className="price-buy">
                    {formatCurrency(product.precioCompra)}
                  </td>
                  <td className="price-sell">
                    {formatCurrency(product.precioVenta)}
                  </td>
                  <td className="margin">
                    <div className="margin-info">
                      <div className="margin-amount">
                        {formatCurrency(product.margenGanancia)}
                      </div>
                      <div className={`margin-percentage ${getMarginClass(product.precioCompra, product.precioVenta)}`}>
                        {getMarginPercentage(product.precioCompra, product.precioVenta)}%
                      </div>
                    </div>
                  </td>
                  <td className="date">
                    {formatDate(product.fechaVenta)}
                  </td>
                  <td className="status">
                    {getStatusBadge(product.estado)}
                  </td>
                  <td className="accesos">
                    <span className="access-count">👁️ {product.accesos}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista de tarjetas */}
      {viewMode === 'cards' && (
        <div className="cards-container">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => onProductClick(product)}
            >
              <div className="card-header">
                <h4 className="product-title">{product.nombreProducto}</h4>
                <div className="product-id-badge">#{product.productoId}</div>
              </div>
              
              <div className="card-content">
                <div className="product-meta">
                  <span className="category-tag">{product.categoria}</span>
                  {getStatusBadge(product.estado)}
                </div>
                
                <div className="sales-info">
                  <div className="quantity-sold">
                    <span className="label">Vendido:</span>
                    <span className="value">{product.cantidadVendida} unidades</span>
                  </div>
                  <div className="date-sold">
                    <span className="label">Fecha:</span>
                    <span className="value">{formatDate(product.fechaVenta)}</span>
                  </div>
                </div>
                
                <div className="financial-info">
                  <div className="price-info">
                    <div className="price-item">
                      <span className="price-label">Compra:</span>
                      <span className="price-value buy">{formatCurrency(product.precioCompra)}</span>
                    </div>
                    <div className="price-item">
                      <span className="price-label">Venta:</span>
                      <span className="price-value sell">{formatCurrency(product.precioVenta)}</span>
                    </div>
                  </div>
                  
                  <div className="margin-info-card">
                    <div className="margin-amount">{formatCurrency(product.margenGanancia)}</div>
                    <div className={`margin-percentage ${getMarginClass(product.precioCompra, product.precioVenta)}`}>
                      {getMarginPercentage(product.precioCompra, product.precioVenta)}% margen
                    </div>
                  </div>
                </div>
                
                <div className="access-info">
                  <span className="access-label">👁️ Accesos:</span>
                  <span className="access-value">{product.accesos}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          <div className="pagination">
            {renderPagination()}
          </div>
          <div className="items-per-page-info">
            {itemsPerPage} elementos por página
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay productos */}
      {products.length === 0 && (
        <div className="no-products">
          <div className="no-products-icon">📋</div>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros para ver más resultados</p>
        </div>
      )}
    </div>
  );
}

export default VentasProductList;