import React, { useState } from 'react';
import '../../pages/styles/ItemDetail.css';
import './styles/ItemDetailPreview.css';

function ItemDetailPreview({ formData: rawFormData, attributeData: rawAttributeData, producto, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('detalles');

  // Normalizar: acepta un producto real de la BD o los datos del formulario
  const catRaw = producto ? producto.categoria : rawFormData?.catalogo;
  const catNorm = (catRaw || '').toLowerCase();

  const item = producto
    ? {
        nombre:                   producto.nombre,
        descripcion:              producto.descripcion,
        precioVenta:              producto.precioVenta,
        stock:                    producto.stock,
        imagenes:                 producto.imagenes || [],
        categoria:                producto.categoria,
        tags:                     producto.tags || [],
        ofertaActiva:             producto.ofertaActiva,
        precioDescuento:          producto.precioDescuento,
        tipoDescuento:            producto.tipoDescuento,
        caracteristicasMates:     producto.caracteristicasMates || {},
        caracteristicasBombillas: producto.caracteristicasBombillas || {},
        caracteristicasCombos:    producto.caracteristicasCombos || {},
      }
    : {
        nombre:      rawFormData?.nombre,
        descripcion: rawFormData?.descripcion,
        precioVenta: rawFormData?.precioVenta,
        stock:       rawFormData?.stock,
        imagenes:    rawFormData?.imagenes || [],
        categoria:   rawFormData?.catalogo,
        tags:        rawFormData?.tags || [],
        caracteristicasMates:     (catNorm === 'mates' || catNorm === 'mate') ? (rawAttributeData || {}) : {},
        caracteristicasBombillas: (catNorm === 'bombillas' || catNorm === 'bombilla') ? (rawAttributeData || {}) : {},
        caracteristicasCombos:    {},
      };

  const cat = (item.categoria || '').toLowerCase();

  // Normalizar imágenes: pueden ser strings base64 o {url, alt}
  const rawImagenes = item.imagenes || [];
  const imagenes = rawImagenes.length > 0
    ? rawImagenes.map((img, i) => ({
        url: typeof img === 'string' ? img : img?.url,
        alt: typeof img === 'object' ? img?.alt : `${item.nombre || 'Imagen'} ${i + 1}`
      })).filter(img => img.url)
    : [{ url: '/placeholder.svg', alt: item.nombre || 'Sin imagen' }];

  const renderDetalles = () => {
    if (cat === 'mates' || cat === 'mate') {
      const m = item.caracteristicasMates || {};
      const chips = [
        m.forma           && { label: 'Forma',          value: m.forma },
        m.tipo            && { label: 'Tipo',            value: m.tipo },
        m.anchoSuperior   && { label: 'Ancho superior',  value: m.anchoSuperior },
        m.anchoInferior   && { label: 'Ancho inferior',  value: m.anchoInferior },
        m.virola === 'Si' && { label: 'Virola',          value: m.tiposDeVirola || 'Incluida' },
        m.guarda === 'Si' && { label: 'Guarda',          value: m.tiposDeGuarda || 'Incluida' },
        m.revestimiento === 'Si' && { label: 'Revestimiento', value: m.tiposDeRevestimientos || 'Incluido' },
        m.curados === 'Si' && { label: 'Curado',         value: m.tiposDeCurados || 'Incluido' },
        m.terminacion     && { label: 'Terminación',     value: m.terminacion },
        m.grabado === 'Si' && { label: 'Grabado',        value: m.descripcionDelGrabado || 'Personalizado' },
        m.color           && { label: 'Color',           value: m.color },
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
    <div className="idp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="idp-modal">
        <div className="idp-header">
          <span className="idp-title-label">Vista previa del producto</span>
          <button className="idp-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="idp-body">
          <div className="item-detail-card idp-card">
            {/* Columna izquierda — imágenes */}
            <div className="item-detail-gallery">
              <div className="item-main-image">
                <img
                  src={imagenes[activeImage]?.url || '/placeholder.svg'}
                  alt={imagenes[activeImage]?.alt || item.nombre}
                  onError={(e) => { e.target.src = '/placeholder.svg'; }}
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
                      <img
                        src={img.url}
                        alt={img.alt || item.nombre}
                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                      />
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

              <h1 className="item-detail-title">
                {item.nombre || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Sin nombre</span>}
              </h1>

              <div className="item-price-row">
                {item.ofertaActiva && item.precioDescuento != null ? (
                  <>
                    <span className="item-price-original">${item.precioVenta}</span>
                    <span className="item-price-oferta">${item.precioDescuento}</span>
                  </>
                ) : (
                  <span className="item-price">
                    {item.precioVenta
                      ? `$${item.precioVenta}`
                      : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Sin precio</span>}
                  </span>
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

              {/* Comprar (deshabilitado en preview) */}
              <div className="item-add-cart">
                {item.stock > 0 ? (
                  <>
                    <div className="item-qty-control">
                      <button disabled>−</button>
                      <span>1</span>
                      <button disabled>+</button>
                    </div>
                    <button className="item-btn-cart" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
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
        </div>
      </div>
    </div>
  );
}

export default ItemDetailPreview;
