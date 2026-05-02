import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header.js';
import Footer from '../components/layout/Footer.js';
import Notification from '../components/ui/Notification.js';
import { CarritoContext } from '../context/CarritoContext.js';
import productoService from '../services/productoService.js';
import Loading from '../components/shared/Loading';
import './styles/ItemDetail.css';

function ItemDetail() {
  const { catalogoId, itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('detalles');
  const [activeImage, setActiveImage] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const { agregarAlCarrito, carrito } = useContext(CarritoContext);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await productoService.obtenerProducto(itemId);
        if (response.success) {
          setItem(response.data);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [itemId]);

  const handleAgregarAlCarrito = () => {
    if (cantidad > 0) {
      agregarAlCarrito({ ...item, cantidad });
      setShowNotification(true);
    }
  };

  const precioFinal = item?.ofertaActiva && item?.precioDescuento != null
    ? item.precioDescuento
    : item?.precioVenta;

  const imagenes = item?.imagenes?.length > 0
    ? item.imagenes
    : [{ url: '/placeholder.svg', alt: item?.nombre }];

  const renderDetalles = () => {
    if (!item) return null;
    const cat = item.categoria;

    if (cat === 'mates') {
      const m = item.caracteristicasMates || {};
      return (
        <div className="item-detail-specs">
          {m.forma         && <div className="spec-row"><span className="spec-label">Forma</span><span className="spec-value">{m.forma}</span></div>}
          {m.tipo          && <div className="spec-row"><span className="spec-label">Tipo</span><span className="spec-value">{m.tipo}</span></div>}
          {m.anchoSuperior && <div className="spec-row"><span className="spec-label">Ancho superior</span><span className="spec-value">{m.anchoSuperior}</span></div>}
          {m.anchoInferior && <div className="spec-row"><span className="spec-label">Ancho inferior</span><span className="spec-value">{m.anchoInferior}</span></div>}
          {m.virola === 'Si'       && <div className="spec-row"><span className="spec-label">Virola</span><span className="spec-value">Sí{m.tiposDeVirola ? ` — ${m.tiposDeVirola}` : ''}</span></div>}
          {m.guarda === 'Si'       && <div className="spec-row"><span className="spec-label">Guarda</span><span className="spec-value">Sí{m.tiposDeGuarda ? ` — ${m.tiposDeGuarda}` : ''}</span></div>}
          {m.revestimiento === 'Si' && <div className="spec-row"><span className="spec-label">Revestimiento</span><span className="spec-value">Sí{m.tiposDeRevestimientos ? ` — ${m.tiposDeRevestimientos}` : ''}</span></div>}
          {m.curados === 'Si'      && <div className="spec-row"><span className="spec-label">Curado</span><span className="spec-value">Sí{m.tiposDeCurados ? ` — ${m.tiposDeCurados}` : ''}</span></div>}
          {m.terminacion   && <div className="spec-row"><span className="spec-label">Terminación</span><span className="spec-value">{m.terminacion}</span></div>}
          {m.grabado === 'Si'      && <div className="spec-row"><span className="spec-label">Grabado</span><span className="spec-value">Sí{m.descripcionDelGrabado ? ` — ${m.descripcionDelGrabado}` : ''}</span></div>}
          {m.color         && <div className="spec-row"><span className="spec-label">Color</span><span className="spec-value">{m.color}</span></div>}
        </div>

      );
    }

    if (cat === 'bombillas') {
      const b = item.caracteristicasBombillas || {};
      return (
        <div className="item-detail-specs">
          {b.forma        && <div className="spec-row"><span className="spec-label">Forma</span><span className="spec-value">{b.forma}</span></div>}
          {b.tipoMaterial && <div className="spec-row"><span className="spec-label">Material</span><span className="spec-value">{b.tipoMaterial}</span></div>}
          {b.tamaño       && <div className="spec-row"><span className="spec-label">Tamaño</span><span className="spec-value">{b.tamaño}</span></div>}
          {b.centimetros  && <div className="spec-row"><span className="spec-label">Largo</span><span className="spec-value">{b.centimetros} cm</span></div>}
        </div>
      );
    }

    if (cat === 'combos') {
      const c = item.caracteristicasCombos || {};
      return (
        <div className="item-detail-specs">
          {c.mate && (
            <div className="spec-row combo-item">
              <span className="spec-label">Mate incluido</span>
              <span className="spec-value">{c.mate.nombre || 'N/D'}</span>
            </div>
          )}
          {c.bombilla && (
            <div className="spec-row combo-item">
              <span className="spec-label">Bombilla incluida</span>
              <span className="spec-value">{c.bombilla.nombre || 'N/D'}</span>
            </div>
          )}
        </div>
      );
    }

    return <p className="spec-empty">Sin detalles disponibles.</p>;
  };

  return (
    <div className="item-detail-page">
      <Header carrito={carrito} userRole="client" />
      <main className="item-detail-main">
        {loading && (
          <Loading text="Cargando producto..." fullPage />
        )}

        {!loading && (error || !item) && (
          <div className="item-not-found">
            <i className="bi bi-emoji-frown"></i>
            <h2>Producto no encontrado</h2>
            <p>El producto que buscas no está disponible.</p>
            <button className="item-back-btn" onClick={() => navigate(-1)}>← Volver</button>
          </div>
        )}

        {!loading && item && (
          <div className="item-detail-card">
            {/* Columna izquierda — imágenes */}
            <div className="item-detail-gallery">
              <div className="item-main-image">
                <img
                  src={imagenes[activeImage]?.url || '/placeholder.svg'}
                  alt={imagenes[activeImage]?.alt || item.nombre}
                />
                {item.ofertaActiva && (
                  <span className="item-badge-oferta">
                    {item.tipoDescuento === 'porcentaje' ? `−${item.precioDescuento}%` : 'Oferta'}
                  </span>
                )}
              </div>
              {imagenes.length > 1 && (
                <div className="item-thumbnails">
                  {imagenes.map((img, i) => (
                    <button
                      key={i}
                      className={`item-thumbnail ${i === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <img src={img.url} alt={img.alt || item.nombre} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha — info */}
            <div className="item-detail-info">
              <button className="item-back-link" onClick={() => navigate(-1)}>← Volver</button>

              {item.categoria && (
                <span className="item-categoria-badge">{item.categoria}</span>
              )}

              <h1 className="item-detail-title">{item.nombre}</h1>

              <div className="item-price-row">
                {item.ofertaActiva && item.precioDescuento != null ? (
                  <>
                    <span className="item-price-original">${item.precioVenta}</span>
                    <span className="item-price-oferta">${item.precioDescuento}</span>
                  </>
                ) : (
                  <span className="item-price">${item.precioVenta}</span>
                )}
              </div>

              <div className={`item-stock-badge ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {item.stock > 0 ? `En stock` : 'Sin stock'}
              </div>

              {item.descripcion && (
                <p className="item-descripcion">{item.descripcion}</p>
              )}

              {/* Tabs */}
              <div className="item-tabs">
                <button
                  className={`item-tab ${activeTab === 'detalles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('detalles')}
                >
                  Características
                </button>
                {item.tags?.length > 0 && (
                  <button
                    className={`item-tab ${activeTab === 'tags' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tags')}
                  >
                    Etiquetas
                  </button>
                )}
              </div>

              <div className="item-tab-panel">
                {activeTab === 'detalles' && renderDetalles()}
                {activeTab === 'tags' && (
                  <div className="item-tags-list">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="item-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Agregar al carrito */}
              {item.stock > 0 && (
                <div className="item-add-cart">
                  <div className="item-qty-control">
                    <button onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                    <span>{cantidad}</span>
                    <button onClick={() => setCantidad(c => Math.min(item.stock, c + 1))}>+</button>
                  </div>
                  <button className="item-btn-cart" onClick={handleAgregarAlCarrito}>
                    Agregar al carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showNotification && (
        <Notification
          message="¡Producto agregado al carrito!"
          onClose={() => setShowNotification(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default ItemDetail;