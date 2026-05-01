import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Paginador from './Paginador.js';
import Filtros from './Filtros.js';
import Ordenador from './Ordenador.js';
import Notification from '../ui/Notification.js';
import CategorySelector from './CategorySelector.js';
import MobileFilters from './MobileFilters.js';
import categoriaService from '../../services/categoriaService';
import { useCarrito } from '../../context/CarritoContext.js';
import '../styles/Catalog.css';

// Devuelve true solo si la oferta está activa Y no ha caducado
const isOfertaVigente = (item) => {
  if (!item.ofertaActiva) return false;
  if (!item.tiempoOferta) return true; // sin límite de tiempo
  return new Date(item.tiempoOferta) > new Date();
};

// Función para calcular el tiempo restante de la oferta
const calcularTiempoRestante = (tiempoOferta) => {
  if (!tiempoOferta) return null;
  
  const ahora = new Date();
  const fin = new Date(tiempoOferta);
  const diferencia = fin - ahora;
  
  if (diferencia <= 0) return null;
  
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  
  if (dias > 0) {
    return `Termina en ${dias} día${dias > 1 ? 's' : ''}`;
  } else if (horas > 0) {
    return `Termina en ${horas} hora${horas > 1 ? 's' : ''}`;
  } else {
    return `Termina en ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  }
};

function Catalogo({ catalogo, hideFiltersButton = false, filteredItems = [], onItemsChange }) {
  const [items, setItems] = useState(catalogo.items);
  const [currentPage, setCurrentPage] = useState(1);
  const [cantidades, setCantidades] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState(null); // Estado para manejar el hover
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false); // Estado para el sidebar móvil
  const [tiempoActual, setTiempoActual] = useState(Date.now()); // Para actualizar el contador
  const [categoriasMobile, setCategoriasMobile] = useState([]); // Categorías para botones móvil
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();

  // Cargar categorías para los botones de filtro móvil
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await categoriaService.obtenerCategorias({ incluirInactivas: 'false' });
        const lista = response.data || response.categorias || [];
        setCategoriasMobile(lista);
      } catch (e) {
        // silently ignore; buttons simply won't render
      }
    };
    fetchCategorias();
  }, []);

  // Actualizar el tiempo cada minuto para las ofertas con límite de tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActual(Date.now());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const itemsToShow = filteredItems.length > 0 ? filteredItems : catalogo.items;
    setItems(itemsToShow);
    setCurrentPage(1);

    const cantidadesIniciales = catalogo.items.reduce((acc, item) => {
      const itemKey = item._id || item.id;
      acc[itemKey] = 1;
      return acc;
    }, {});
    setCantidades(cantidadesIniciales);
  }, [catalogo, filteredItems]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemClick = (itemId, itemCategoria) => {
    // Asegurarse de que itemId sea válido antes de navegar
    if (!itemId) {
      return;
    }
    
    // Usar la categoría del item en lugar del catálogo cuando estamos en "todos"
    const categoria = catalogo.nombre === 'todos' ? itemCategoria : catalogo.nombre;
    
    navigate(`/item/${categoria}/${itemId}`);
  };

  const handleCantidadChange = (itemId, nuevaCantidad) => {
    setCantidades((prevCantidades) => ({
      ...prevCantidades,
      [itemId]: nuevaCantidad,
    }));
  };

  const handleAgregarAlCarrito = async (item) => {
    const cantidad = cantidades[item.id] || 1;
    if (cantidad > 0) {
      try {
        const resultado = await agregarAlCarrito({ ...item, cantidad });
        if (resultado.success) {
          setNotificationMessage(`¡${item.nombre} agregado al carrito!`);
          setShowNotification(true);
        } else {
          setNotificationMessage(`Error: ${resultado.error || 'No se pudo agregar al carrito'}`);
          setShowNotification(true);
        }
      } catch (error) {
        setNotificationMessage('Error al agregar al carrito');
        setShowNotification(true);
      }
    }
  };

  const handleMouseEnter = (itemId) => {
    setHoveredItemId(itemId); // Establece el ID del ítem que está siendo hovered
  };

  const handleMouseLeave = () => {
    setHoveredItemId(null); // Resetea el hover cuando el mouse sale del ítem
  };

  const handleCategoryNavigate = (slug) => {
    if (!slug) {
      navigate('/catalog');
    } else {
      navigate(`/catalogo/${slug}`);
    }
  };

  return (
    <div className="catalogo">
      {/* Solo mostrar controles si hay productos en la categoría */}
      {catalogo.items.length > 0 && (
        <>
          {/* Controles para desktop */}
          <div className="catalogo-controls desktop-controls">
            <Filtros items={catalogo.items} onFilter={setItems} />
            <div className="controls-row">
              <CategorySelector currentCategory={catalogo.nombre} />
              <Ordenador items={items} onSort={setItems} />
            </div>
          </div>

          {/* Botón para abrir filtros en móvil - solo si no está oculto */}
          {!hideFiltersButton && (
            <>
              <div className="mobile-filters-trigger">
                <button 
                  className="mobile-filters-button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6H20M4 12H16M4 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="button-text-full">Filtros y Ordenar</span>
                  <span className="button-text-short">Filtros</span>
                </button>
              </div>

              {/* Sidebar móvil */}
              <MobileFilters
                isOpen={isMobileFiltersOpen}
                onClose={() => setIsMobileFiltersOpen(false)}
                catalogoItems={catalogo.items}
                currentItems={items}
                currentCategory={catalogo.nombre}
                onFilter={onItemsChange || setItems}
                onSort={onItemsChange || setItems}
              />
            </>
          )}
        </>
      )}

      {/* Botones de categoría para móvil */}
      {categoriasMobile.length > 0 && (
        <div className="mobile-category-filters">
          <button
            className={`mobile-category-btn${catalogo.nombre === 'todos' || catalogo.nombre === 'catalog' ? ' active' : ''}`}
            onClick={() => handleCategoryNavigate(null)}
          >
            Todos
          </button>
          {categoriasMobile.map((cat) => (
            <button
              key={cat._id}
              className={`mobile-category-btn${
                catalogo.nombre === cat.nombre || catalogo.nombre === cat.slug ? ' active' : ''
              }`}
              onClick={() => handleCategoryNavigate(cat.slug || cat.nombre.toLowerCase())}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="catalogo-items">
        {currentItems.length === 0 ? (
          // Mensaje amigable cuando no hay productos
          <div className="empty-catalog-container">
            <div className="empty-catalog-content">
              <div className="empty-catalog-icon">
                <img 
                  src="/logo-png.png" 
                  alt="Calmate Vibes Logo" 
                  className="empty-catalog-logo"
                />
              </div>
              <h3 className="empty-catalog-title">
                ¡Pronto tendremos productos aquí!
              </h3>
              <p className="empty-catalog-message">
                Estamos trabajando en traerte los mejores productos para esta categoría. 
                Mientras tanto, puedes explorar nuestras otras secciones.
              </p>
              <div className="empty-catalog-actions">
                <button 
                  className="empty-catalog-btn primary"
                  onClick={() => navigate('/catalog')}
                >
                  Ver todos los productos
                </button>
              </div>
            </div>
          </div>
        ) : (
          currentItems.map((item, idx) => (
            <div
              className="catalogo-item"
              key={idx}
              onMouseEnter={() => handleMouseEnter(item._id || item.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Badge de oferta */}
              {isOfertaVigente(item) && (
                <div className="product-badge oferta">
                  🔥 OFERTA
                </div>
              )}

              {/* Badge de estado */}
              {item.estado && !isOfertaVigente(item) && (
                <div className={`product-badge ${item.estado.toLowerCase().replace(' ', '-')}`}>
                  {item.estado}
                </div>
              )}

              {/* Container de imagen */}
              <div 
                className="catalogo-item-image-container"
                onClick={() => handleItemClick(item._id || item.id, item.categoria)}
              >
                <img
                  src={
                    hoveredItemId === (item._id || item.id) && 
                    ((item.imagenes && item.imagenes.length > 1) || item.imagenHover)
                      ? (
                          // Priorizar el array de imágenes si tiene más de una
                          item.imagenes && item.imagenes.length > 1 
                            ? item.imagenes[1].url || item.imagenes[1]
                            : item.imagenHover
                        )
                      : (item.imagenes?.[0]?.url || item.imagenes?.[0] || item.imagen || '/placeholder.svg')
                  }
                  alt={item.nombre}
                  className="catalogo-item-image"
                  loading="lazy"
                />
              </div>

            {/* Información del producto */}
            <div className="catalogo-item-content">
              <div className="catalogo-item-info">
                {/* Precio */}
                <div className="catalogo-item-price">
                  {isOfertaVigente(item) ? (
                    <div className="price-container">
                      <span className="price-oferta">
                        ${item.tipoDescuento === 'porcentaje' 
                          ? (item.precioVenta * (1 - item.precioDescuento / 100)).toFixed(0)
                          : item.precioDescuento
                        }
                      </span>
                      <span className="price-original">${item.precioVenta}</span>
                      {item.tipoDescuento === 'porcentaje' && (
                        <span className="discount-badge">
                          -{item.precioDescuento}%
                        </span>
                      )}
                    </div>
                  ) : (
                    `$${item.precioVenta}`
                  )}
                </div>

                {/* Tiempo restante de la oferta */}
                {isOfertaVigente(item) && item.tiempoOferta && calcularTiempoRestante(item.tiempoOferta) && (
                  <div className="offer-countdown">
                    ⏱️ {calcularTiempoRestante(item.tiempoOferta)}
                  </div>
                )}

                {/* Nombre del producto */}
                <h3 className="catalogo-item-title" onClick={() => handleItemClick(item._id || item.id, item.categoria)}>
                  {item.nombre}
                </h3>

                {/* Categoría/Subcategoría */}
                <div className="catalogo-item-category">
                  {item.categoria || 'Mates y Accesorios'}
                </div>

                {/* Colores disponibles */}
                {item.colores && (
                  <div className="catalogo-item-colors">
                    {item.colores} colores
                  </div>
                )}

                {/* Estado adicional */}
                {item.estadoVenta && (
                  <div className="catalogo-item-status">
                    {item.estadoVenta}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="catalogo-item-actions">
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleCantidadChange(item._id || item.id, Math.max(1, cantidades[item._id || item.id] - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-display">{cantidades[item._id || item.id] || 1}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleCantidadChange(item._id || item.id, cantidades[item._id || item.id] + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAgregarAlCarrito(item)}
                >
                  Comprar
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Solo mostrar paginador si hay productos */}
      {currentItems.length > 0 && (
        <Paginador
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      {showNotification && (
        <Notification
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}

export default Catalogo;