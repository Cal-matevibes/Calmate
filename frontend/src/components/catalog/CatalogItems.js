import React, { useState } from 'react';
import '../styles/CatalogItems.css';
import EmptyState from './EmptyState'; // Importamos el nuevo componente

function CatalogItems({ catalogo, catalogos, onEditItem, onPreviewItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  // Debug: Logging básico para verificar la estructura de datos

  // Filtrar los items según el término de búsqueda
  const filterItems = (items) =>
    items.filter((item) => {
      const itemName = item.nombre?.toLowerCase() || ''; // Aseguramos que el nombre esté en minúsculas y no sea undefined
      const search = searchTerm.trim().toLowerCase(); // Eliminamos espacios y convertimos el término de búsqueda a minúsculas
      return itemName.includes(search); // Verificamos si el nombre incluye el término de búsqueda
    });

  return (
    <div className="catalog-items">
      <h2 className="catalog-item-title">
        {catalogo === 'all' ? 'Todos los Items' : `Items en ${catalogo?.nombre || ''}`}
      </h2>

      {/* Buscador */}
      <div className="catalog-search">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {catalogo === 'all' ? (
        // Mostrar todos los catálogos como secciones separadas
        catalogos.map((cat) => {
          const filteredItems = filterItems(cat.items);
          return (
            <div key={cat.id} className="catalog-section">
              <h3 className="catalog-section-title">{cat.nombre}</h3>
              <div className="catalog-items-grid">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div key={item.id} className="catalog-item-card">
                      <img 
                        src={item.imagenes?.[0]?.url || item.imagen || '/placeholder.svg'} 
                        alt={item.nombre} 
                        className="catalog-item-image"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="catalog-item-info">
                        <h3 className="item-title">{item.nombre}</h3>
                        <p className="item-label">Precio: ${item.precioVenta}</p>
                        <p className="item-label">Stock: {item.stock}</p>
                        <button onClick={() => onEditItem(item)}>Editar</button>
                        <button onClick={() => onDeleteItem(item.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message={`No hay elementos en el catálogo "${cat.nombre}".`} />
                )}
              </div>
            </div>
          );
        })
      ) : (
        // Mostrar los items del catálogo seleccionado
        <div className="catalog-items-grid">
          {filterItems(catalogo?.items || []).length > 0 ? (
            filterItems(catalogo.items).map((item) => (
              <div key={item.id} className="catalog-item-card">
                <img 
                  src={item.imagenes?.[0]?.url || item.imagen || '/placeholder.svg'} 
                  alt={item.nombre} 
                  className="catalog-item-image"
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
                <div className="catalog-item-info">
                  <h3 className="item-title">{item.nombre}</h3>
                  <p className="item-label">Precio: ${item.precioVenta}</p>
                  <p className="item-label">Stock: {item.stock}</p>
                  <button onClick={() => onEditItem(item)}>Editar</button>
                  <button onClick={() => onDeleteItem(item.id)}>Eliminar</button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No se encontraron elementos que coincidan con la búsqueda." />
          )}
        </div>
      )}
    </div>
  );
}

export default CatalogItems;