import React, { useState } from 'react';
import '../../pages/styles/ItemDetail.css';
import './styles/ItemDetailPreview.css';

function ItemDetailPreview({ formData, attributeData = {}, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('detalles');

  const categoria = (formData.catalogo || '').toLowerCase();

  // Normalizar imágenes: pueden ser strings base64 o {url, alt}
  const rawImagenes = formData.imagenes || [];
  const imagenes = rawImagenes.length > 0
    ? rawImagenes.map((img, i) => ({
        url: typeof img === 'string' ? img : img?.url,
        alt: typeof img === 'object' ? img?.alt : `${formData.nombre || 'Imagen'} ${i + 1}`
      })).filter(img => img.url)
    : [{ url: '/placeholder.svg', alt: formData.nombre || 'Sin imagen' }];

  // Construir caracteristicas desde attributeData (datos del formulario aún no guardados)
  const caracteristicasMates = categoria === 'mates' || categoria === 'mate' ? attributeData : {};
  const caracteristicasBombillas = categoria === 'bombillas' || categoria === 'bombilla' ? attributeData : {};

  const renderDetalles = () => {
    if (categoria === 'mates' || categoria === 'mate') {
      const m = caracteristicasMates;
      const hasAny = m.forma || m.tipo || m.anchoSuperior || m.anchoInferior || m.medidaExterior || m.medidaInterior ||
        m.virola === 'Si' || m.guarda === 'Si' || m.revestimiento === 'Si' || m.curados === 'Si' ||
        m.terminacion || m.grabado === 'Si' || m.color;
      if (!hasAny) return <p className="spec-empty">Sin características cargadas.</p>;
      return (
        <div className="item-detail-specs">
          {m.forma         && <div className="spec-row"><span className="spec-label">Forma</span><span className="spec-value">{m.forma}</span></div>}
          {m.tipo          && <div className="spec-row"><span className="spec-label">Tipo</span><span className="spec-value">{m.tipo}</span></div>}
          {(m.anchoSuperior || m.medidaExterior) && <div className="spec-row"><span className="spec-label">Medida exterior</span><span className="spec-value">{m.anchoSuperior || m.medidaExterior}</span></div>}
          {(m.anchoInferior || m.medidaInterior) && <div className="spec-row"><span className="spec-label">Medida interior</span><span className="spec-value">{m.anchoInferior || m.medidaInterior}</span></div>}
          {m.virola === 'Si' && <div className="spec-row"><span className="spec-label">Virola</span><span className="spec-value">Sí{m.tiposDeVirola ? ` — ${m.tiposDeVirola}` : ''}</span></div>}
          {m.guarda === 'Si' && <div className="spec-row"><span className="spec-label">Guarda</span><span className="spec-value">Sí{m.tiposDeGuarda ? ` — ${m.tiposDeGuarda}` : ''}</span></div>}
          {m.revestimiento === 'Si' && <div className="spec-row"><span className="spec-label">Revestimiento</span><span className="spec-value">Sí{m.tiposDeRevestimientos ? ` — ${m.tiposDeRevestimientos}` : ''}</span></div>}
          {m.curados === 'Si' && <div className="spec-row"><span className="spec-label">Curado</span><span className="spec-value">Sí{m.tiposDeCurados ? ` — ${m.tiposDeCurados}` : ''}</span></div>}
          {m.terminacion   && <div className="spec-row"><span className="spec-label">Terminación</span><span className="spec-value">{m.terminacion}</span></div>}
          {m.grabado === 'Si' && <div className="spec-row"><span className="spec-label">Grabado</span><span className="spec-value">Sí{m.descripcionDelGrabado ? ` — ${m.descripcionDelGrabado}` : ''}</span></div>}
          {m.color         && <div className="spec-row"><span className="spec-label">Color</span><span className="spec-value">{m.color}</span></div>}
        </div>
      );
    }

    if (categoria === 'bombillas' || categoria === 'bombilla') {
      const b = caracteristicasBombillas;
      const hasAny = b.forma || b.tipoMaterial || b.tamaño || b.centimetros;
      if (!hasAny) return <p className="spec-empty">Sin características cargadas.</p>;
      return (
        <div className="item-detail-specs">
          {b.forma        && <div className="spec-row"><span className="spec-label">Forma</span><span className="spec-value">{b.forma}</span></div>}
          {b.tipoMaterial && <div className="spec-row"><span className="spec-label">Material</span><span className="spec-value">{b.tipoMaterial}</span></div>}
          {b.tamaño       && <div className="spec-row"><span className="spec-label">Tamaño</span><span className="spec-value">{b.tamaño}</span></div>}
          {b.centimetros  && <div className="spec-row"><span className="spec-label">Largo</span><span className="spec-value">{b.centimetros} cm</span></div>}
        </div>
      );
    }

    return <p className="spec-empty">Sin detalles disponibles.</p>;
  };

  return (
    <div className="idp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="idp-modal">
        {/* Header del modal */}
        <div className="idp-header">
          <span className="idp-title-label">Vista previa del producto</span>
          <button className="idp-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Contenido con el estilo exacto de ItemDetail */}
        <div className="idp-body">
          <div className="item-detail-card idp-card">
            {/* Columna izquierda — imágenes */}
            <div className="item-detail-gallery">
              <div className="item-main-image">
                <img
                  src={imagenes[activeImage]?.url || '/placeholder.svg'}
                  alt={imagenes[activeImage]?.alt || formData.nombre}
                  onError={(e) => { e.target.src = '/placeholder.svg'; }}
                />
              </div>
              {imagenes.length > 1 && (
                <div className="item-thumbnails">
                  {imagenes.map((img, i) => (
                    <button
                      key={i}
                      className={`item-thumbnail ${i === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <img
                        src={img.url}
                        alt={img.alt || formData.nombre}
                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha — info */}
            <div className="item-detail-info">
              {formData.catalogo && (
                <span className="item-categoria-badge">{formData.catalogo}</span>
              )}

              <h1 className="item-detail-title">
                {formData.nombre || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Sin nombre</span>}
              </h1>

              <div className="item-price-row">
                <span className="item-price">
                  {formData.precioVenta
                    ? `$${parseFloat(formData.precioVenta).toLocaleString('es-AR')}`
                    : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Sin precio</span>}
                </span>
              </div>

              <div className={`item-stock-badge ${parseInt(formData.stock) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {parseInt(formData.stock) > 0
                  ? `✓ En stock (${formData.stock} disponibles)`
                  : '✗ Sin stock'}
              </div>

              {formData.descripcion && (
                <p className="item-descripcion">{formData.descripcion}</p>
              )}

              {/* Tabs */}
              <div className="item-tabs">
                <button
                  className={`item-tab ${activeTab === 'detalles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('detalles')}
                >
                  Características
                </button>
              </div>

              <div className="item-tab-panel">
                {activeTab === 'detalles' && renderDetalles()}
              </div>

              {/* Botón de carrito deshabilitado (es preview) */}
              {parseInt(formData.stock) > 0 && (
                <div className="item-add-cart">
                  <div className="item-qty-control">
                    <button disabled>−</button>
                    <span>1</span>
                    <button disabled>+</button>
                  </div>
                  <button className="item-btn-cart" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    Agregar al carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetailPreview;
