import React from 'react';
import '../styles/AdminItemsView.css';

function AdminItemsView({ 
  items, 
  viewMode, 
  onEditItem, 
  onPreviewItem, 
  onDeleteItem,
  selectedCatalogo 
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getStockLabel = (stock) => {
    if (stock === 0) return 'Sin Stock';
    if (stock <= 5) return 'Stock Bajo';
    return 'En Stock';
  };

  // Helper para obtener la imagen principal del item
  const getItemImage = (item) => {    
    // Prioridad: imagenes[0].url, imagen, imagenHover, placeholder
    if (item.imagenes && item.imagenes.length > 0 && item.imagenes[0]) {
      // Si es un objeto con url
      if (typeof item.imagenes[0] === 'object' && item.imagenes[0].url) {
        return item.imagenes[0].url;
      }
      // Si es un string directo
      if (typeof item.imagenes[0] === 'string') {
        return item.imagenes[0];
      }
    }
    
    // Fallbacks
    if (item.imagen) {
      return item.imagen;
    }
    if (item.imagenHover) {
      return item.imagenHover;
    }
    
    return '/placeholder.svg';
  };

  if (items.length === 0) {
    return (
      <div className="no-items">
        <div className="no-items-icon">📦</div>
        <h3>No hay items que mostrar</h3>
        <p>No se encontraron items con los filtros seleccionados.</p>
      </div>
    );
  }

  // Vista de Tabla
  if (viewMode === 'table') {
    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.catalogoId || selectedCatalogo}-${item.id}`}>
                <td>
                  <img 
                    src={getItemImage(item)} 
                    alt={item.nombre}
                    className="table-item-image"
                  />
                </td>
                <td>
                  <div className="item-name">{item.nombre}</div>
                  <div className="item-description">{item.descripcion}</div>
                </td>
                <td>
                  <span className="category-badge">{item.categoria}</span>
                </td>
                <td className="price-cell">{formatPrice(item.precioVenta)}</td>
                <td className="stock-cell">{item.stock}</td>
                <td>
                  <span className={`stock-status ${getStockStatus(item.stock)}`}>
                    {getStockLabel(item.stock)}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      onClick={() => onPreviewItem(item)}
                      className="action-btn preview"
                      title="Vista previa"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => onEditItem(item)}
                      className="action-btn edit"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onDeleteItem(item)}
                      className="action-btn delete"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Vista de Lista
  if (viewMode === 'list') {
    return (
      <div className="admin-list">
        {items.map((item) => (
          <div key={`${item.catalogoId || selectedCatalogo}-${item.id}`} className="list-item">
            <div className="list-item-image">
              <img 
                src={getItemImage(item)} 
                alt={item.nombre}
              />
            </div>
            <div className="list-item-content">
              <div className="list-item-header">
                <h3 className="list-item-name">{item.nombre}</h3>
                <span className="list-item-price">{formatPrice(item.precioVenta)}</span>
              </div>
              <div className="list-item-details">
                <span className="category-badge">{item.categoria}</span>
                <span className={`stock-status ${getStockStatus(item.stock)}`}>
                  Stock: {item.stock}
                </span>
              </div>
              <p className="list-item-description">{item.descripcion}</p>
            </div>
            <div className="list-item-actions">
              <button 
                onClick={() => onPreviewItem(item)}
                className="action-btn preview"
              >
                👁️ Ver
              </button>
              <button 
                onClick={() => onEditItem(item)}
                className="action-btn edit"
              >
                ✏️ Editar
              </button>
              <button 
                onClick={() => onDeleteItem(item)}
                className="action-btn delete"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vista de Grid (por defecto)
  return (
    <div className="admin-grid">
      {items.map((item) => (
        <div key={`${item.catalogoId || selectedCatalogo}-${item.id}`} className="grid-item">
          <div className="grid-item-image">
            <img 
              src={getItemImage(item)} 
              alt={item.nombre}
            />
            <span className={`stock-badge ${getStockStatus(item.stock)}`}>
              {item.stock}
            </span>
          </div>
          <div className="grid-item-content">
            <span className="category-badge small">{item.categoria}</span>
            <h3 className="grid-item-name">{item.nombre}</h3>
            <p className="grid-item-description">{item.descripcion}</p>
            <div className="grid-item-price">{formatPrice(item.precioVenta)}</div>
          </div>
          <div className="grid-item-actions">
            <button 
              onClick={() => onPreviewItem(item)}
              className="action-btn preview small"
            >
              👁️
            </button>
            <button 
              onClick={() => onEditItem(item)}
              className="action-btn edit small"
            >
              ✏️
            </button>
            <button 
              onClick={() => onDeleteItem(item)}
              className="action-btn delete small"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminItemsView;