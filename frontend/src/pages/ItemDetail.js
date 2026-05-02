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
    const cat = item.categoria?.toLowerCase();

    if (cat === 'mates' || cat === 'mate') {
      const m = item.caracteristicasMates || {};
      const chips = [
        m.forma         && { label: 'Forma',          value: m.forma },
        m.tipo          && { label: 'Tipo',            value: m.tipo },
        m.anchoSuperior && { label: 'Ancho superior',  value: m.anchoSuperior },
        m.anchoInferior && { label: 'Ancho inferior',  value: m.anchoInferior },
        m.virola === 'Si' && { label: 'Virola',        value: m.tiposDeVirola || 'Incluida' },
        m.guarda === 'Si' && { label: 'Guarda',        value: m.tiposDeGuarda || 'Incluida' },
        m.revestimiento === 'Si' && { label: 'Revestimiento', value: m.tiposDeRevestimientos || 'Incluido' },
        m.curados === 'Si' && { label: 'Curado',       value: m.tiposDeCurados || 'Incluido' },
        m.terminacion   && { label: 'Terminación',     value: m.terminacion },
        m.grabado === 'Si' && { label: 'Grabado',      value: m.descripcionDelGrabado || 'Personalizado' },
        m.color         && { label: 'Color',           value: m.color },
      ].filter(Boolean);

      return chips.length > 0 ? (
        <div className="item-detail-specs">
          {chips.map(({ label, value }) => (
            <div key={label} className="spec-chip">
              <span className="spec-chip-label">{label}</span>
              <span className="spec-chip-value">{value}</span>
            </div>
          ))}
        </div>
      ) : <p className="spec-empty">Sin detalles disponibles.</p>;
    }

    if (cat === 'bombillas' || cat === 'bombilla') {
      const b = item.caracteristicasBombillas || {};
      const chips = [
        b.forma        && { label: 'Forma',    value: b.forma },
        b.tipoMaterial && { label: 'Material', value: b.tipoMaterial },
        b.tamaño       && { label: 'Tamaño',   value: b.tamaño },
        b.centimetros  && { label: 'Largo',    value: `${b.centimetros} cm` },
      ].filter(Boolean);

      return chips.length > 0 ? (
        <div className="item-detail-specs">
          {chips.map(({ label, value }) => (
            <div key={label} className="spec-chip">
              <span className="spec-chip-label">{label}</span>
              <span className="spec-chip-value">{value}</span>
            </div>
          ))}
        </div>
      ) : <p className="spec-empty">Sin detalles disponibles.</p>;
    }

    if (cat === 'combos') {
      const c = item.caracteristicasCombos || {};
      return (
        <div className="item-detail-specs">
          {c.mate && (
            <div className="spec-chip">
              <span className="spec-chip-label">Mate</span>
              <span className="spec-chip-value">{c.mate.nombre || 'N/D'}</span>
            </div>
          )}
          {c.bombilla && (
            <div className="spec-chip">
              <span className="spec-chip-label">Bombilla</span>
              <span className="spec-chip-value">{c.bombilla.nombre || 'N/D'}</span>
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
              <button className="item-back-link" onClick={() => navigate(-1)}>← Volver</button>
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

              <div className="item-badges-row">
                {item.categoria && (
                  <span className="item-categoria-badge">{item.categoria}</span>
                )}
                <div className={`item-stock-badge ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {item.stock > 0 ? 'En stock' : 'Sin stock'}
                </div>
              </div>

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

              {/* Comprar */}
              <div className="item-add-cart">
                {item.stock > 0 ? (
                  <>
                    <div className="item-qty-control">
                      <button onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                      <span>{cantidad}</span>
                      <button onClick={() => setCantidad(c => Math.min(item.stock, c + 1))}>+</button>
                    </div>
                    <button className="item-btn-cart" onClick={handleAgregarAlCarrito}>
                      Comprar
                    </button>
                  </>
                ) : (
                  <button className="item-btn-cart item-btn-cart--agotado" disabled>
                    Sin stock
                  </button>
                )}
              </div>
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