import React from 'react';
import '../styles/SimpleItemForm.css';

function SimpleItemForm({ 
  formData, 
  attributeData = {},
  onInputChange, 
  onImageUpload, 
  onImageRemove, 
  onSubmit, 
  onPreview, 
  catalogos, 
  onCatalogChange,
  availableAttributes = {},
  onAttributeChange
}) {
  // Función para obtener etiquetas más legibles para los atributos
  const getAttributeLabel = (attrName) => {
    const labels = {
      'tipo': 'Tipo',
      'material': 'Material',
      'materialInterno': 'Material Interno',
      'tamaño': 'Tamaño',
      'tamañoInterno': 'Tamaño Interno',
      'virola': 'Virola',
      'terminacion': 'Terminación',
      'grabado': 'Grabado',
      'descripcionDelGrabado': 'Descripción del Grabado',
      'base': 'Base',
      'color': 'Color'
    };
    return labels[attrName] || attrName.charAt(0).toUpperCase() + attrName.slice(1);
  };

  // Debug log para verificar la categoría seleccionada
  
  return (
    <form onSubmit={onSubmit} className="simple-item-form">
      <div className="form-section">
        <h3>Información Básica</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={onInputChange}
              placeholder="Ingrese el nombre del producto"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="catalogo">Categoría *</label>
            <select
              id="catalogo"
              name="catalogo"
              value={formData.catalogo}
              onChange={onCatalogChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {catalogos && catalogos.length > 0 ? (
                catalogos.map(categoria => (
                  <option key={categoria.id} value={categoria.nombre}>
                    {categoria.nombreDisplay || categoria.nombre}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay categorías disponibles</option>
              )}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={onInputChange}
            placeholder="Describe el producto..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Precios y Stock</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precioVenta">Precio de Venta *</label>
            <input
              type="number"
              id="precioVenta"
              name="precioVenta"
              value={formData.precioVenta}
              onChange={onInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={onInputChange}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Configuración específica para Combos - COMPLETAMENTE DINÁMICO */}
      {(formData.catalogo === 'combos' || formData.catalogo?.toLowerCase() === 'combos') && (
        <div className="form-section">
          <h3>Productos del Combo</h3>
          <div className="combo-selector">
            
            {/* Sistema dinámico de productos para combo */}
            <div className="combo-products-container">
              <p className="combo-instructions">
                Selecciona productos de diferentes categorías para crear tu combo:
              </p>
              
              {/* Renderizar selectores para todas las categorías disponibles (excepto la actual) */}
              {catalogos && catalogos
                .filter(categoria => categoria.nombre?.toLowerCase() !== 'combos' && categoria.items && categoria.items.length > 0)
                .map((categoria) => {
                  const categoryKey = `combo_${categoria.nombre}`;
                  const selectedProductId = attributeData[categoryKey];
                  const selectedProduct = selectedProductId ? categoria.items.find(item => item.id === selectedProductId) : null;
                  
                  return (
                    <div key={categoria.id} className="form-group combo-category-selector">
                      <label htmlFor={categoryKey} className="combo-category-label">
                        <span className="category-name">{categoria.nombreDisplay || categoria.nombre}:</span>
                        {selectedProduct && (
                          <span className="selected-indicator"> ✓ {selectedProduct.nombre}</span>
                        )}
                      </label>
                      <select 
                        id={categoryKey}
                        name={categoryKey}
                        value={selectedProductId || ''}
                        onChange={(e) => onAttributeChange && onAttributeChange(categoryKey, e.target.value)}
                        className="combo-product-select"
                      >
                        <option value="">-- No incluir {categoria.nombre.toLowerCase()} --</option>
                        {categoria.items.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.nombre} - ${item.precioVenta ? item.precioVenta.toFixed(2) : '0.00'}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              }
              
              {/* Mensaje si no hay categorías disponibles */}
              {(!catalogos || catalogos.filter(cat => cat.nombre?.toLowerCase() !== 'combos' && cat.items?.length > 0).length === 0) && (
                <div className="no-categories-message">
                  <p>⚠️ No hay categorías con productos disponibles para crear combos.</p>
                  <p>Primero crea productos en otras categorías.</p>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="comboQuantity">Cantidad de cada producto:</label>
              <input
                type="number"
                id="comboQuantity"
                name="comboQuantity"
                min="1"
                value={attributeData.comboQuantity || 1}
                onChange={(e) => onAttributeChange && onAttributeChange('comboQuantity', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            
            {/* Selector de cantidad para el combo */}
            <div className="form-group">
              <label htmlFor="comboQuantity">Cantidad de cada producto en el combo:</label>
              <input
                type="number"
                id="comboQuantity"
                name="comboQuantity"
                min="1"
                max="10"
                value={attributeData.comboQuantity || 1}
                onChange={(e) => onAttributeChange && onAttributeChange('comboQuantity', parseInt(e.target.value) || 1)}
                placeholder="1"
                className="combo-quantity-input"
              />
              <small className="quantity-help">Cantidad de cada producto que incluirá el combo</small>
            </div>

            {/* Mostrar resumen y precio sugerido dinámico */}
            {(() => {
              // Obtener todos los productos seleccionados usando las claves dinámicas
              const selectedProducts = [];
              // const totalProducts = catalogos ? catalogos
              //   .filter(categoria => categoria.nombre?.toLowerCase() !== 'combos' && categoria.items?.length > 0)
              //   .length : 0;
              
              catalogos && catalogos.forEach(categoria => {
                if (categoria.nombre?.toLowerCase() !== 'combos') {
                  const categoryKey = `combo_${categoria.nombre}`;
                  const selectedId = attributeData[categoryKey];
                  if (selectedId && categoria.items) {
                    const product = categoria.items.find(item => item.id === selectedId);
                    if (product) {
                      selectedProducts.push({
                        ...product,
                        categoria: categoria.nombre,
                        categoryKey: categoryKey
                      });
                    }
                  }
                }
              });
              
              // Mostrar información si hay productos seleccionados
              if (selectedProducts.length === 0) {
                return (
                  <div className="combo-status">
                    <p className="combo-help">
                      💡 Selecciona al menos 2 productos de diferentes categorías para crear el combo
                    </p>
                  </div>
                );
              }

              // Mostrar resumen de productos seleccionados
              return (
                <div className="combo-summary">
                  <h4>Resumen del Combo ({selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}):</h4>
                  
                  <div className="selected-products-list">
                    {selectedProducts.map((product, index) => (
                      <div key={index} className="selected-product-item">
                        <span className="product-info">
                          <strong>{product.nombre}</strong>
                          <span className="category-badge">({product.categoria})</span>
                        </span>
                        <span className="product-price">${product.precioVenta ? product.precioVenta.toFixed(2) : '0.00'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mostrar precio sugerido si hay al menos 2 productos */}
                  {selectedProducts.length >= 2 && (
                    <div className="combo-price-calculation">
                      <div className="price-breakdown">
                        <div className="individual-total">
                          <span>Precio individual total:</span>
                          <span>${(() => {
                            const quantity = attributeData.comboQuantity || 1;
                            const total = selectedProducts.reduce((sum, product) => sum + (product.precioVenta || 0), 0) * quantity;
                            return total.toFixed(2);
                          })()}</span>
                        </div>
                        <div className="combo-discount">
                          <span>Descuento del combo (10%):</span>
                          <span className="discount-amount">-${(() => {
                            const quantity = attributeData.comboQuantity || 1;
                            const total = selectedProducts.reduce((sum, product) => sum + (product.precioVenta || 0), 0) * quantity;
                            const discount = total * 0.1;
                            return discount.toFixed(2);
                          })()}</span>
                        </div>
                        <div className="suggested-price-final">
                          <span><strong>Precio sugerido del combo:</strong></span>
                          <span className="final-price"><strong>${(() => {
                            const quantity = attributeData.comboQuantity || 1;
                            const total = selectedProducts.reduce((sum, product) => sum + (product.precioVenta || 0), 0) * quantity;
                            const finalPrice = total * 0.9;
                            return finalPrice.toFixed(2);
                          })()}</strong></span>
                        </div>
                      </div>
                      
                      <div className="combo-savings">
                        <small>💰 ¡Ahorro de ${(() => {
                          const quantity = attributeData.comboQuantity || 1;
                          const total = selectedProducts.reduce((sum, product) => sum + (product.precioVenta || 0), 0) * quantity;
                          const savings = total * 0.1;
                          return savings.toFixed(2);
                        })()} por combo!</small>
                      </div>
                    </div>
                  )}

                  {/* Sugerencia si solo hay 1 producto seleccionado */}
                  {selectedProducts.length === 1 && (
                    <div className="combo-suggestion">
                      <p className="single-product-tip">
                        ℹ️ Selecciona al menos un producto más para activar el descuento del combo
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Características específicas para MATES */}
      {(formData.catalogo?.toLowerCase() === 'mate' || formData.catalogo?.toLowerCase() === 'mates') && (
        <div className="form-section mate-characteristics">
          <h3>Características de los Mates</h3>
          
          {/* Forma */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="forma">Forma:</label>
              <select 
                id="forma"
                name="forma"
                value={attributeData.forma || ''}
                onChange={(e) => onAttributeChange && onAttributeChange('forma', e.target.value)}
              >
                <option value="">Seleccionar forma</option>
                <option value="Camionero">Camionero</option>
                <option value="Imperial">Imperial</option>
                <option value="Torpedo">Torpedo</option>
                {attributeData.forma && !['Camionero', 'Imperial', 'Torpedo'].includes(attributeData.forma) && (
                  <option value={attributeData.forma}>{attributeData.forma}</option>
                )}
              </select>
              <input
                type="text"
                placeholder="O ingresa otra forma..."
                value={attributeData.formaCustom || ''}
                onChange={(e) => {
                  onAttributeChange && onAttributeChange('formaCustom', e.target.value);
                  onAttributeChange && onAttributeChange('forma', e.target.value);
                }}
                className="custom-input-small"
              />
            </div>

            {/* Tipo */}
            <div className="form-group">
              <label htmlFor="tipo">Tipo:</label>
              <select 
                id="tipo"
                name="tipo"
                value={attributeData.tipo || ''}
                onChange={(e) => onAttributeChange && onAttributeChange('tipo', e.target.value)}
              >
                <option value="">Seleccionar tipo</option>
                <option value="Calabaza">Calabaza</option>
                <option value="Algarrobo">Algarrobo</option>
                {attributeData.tipo && !['Calabaza', 'Algarrobo'].includes(attributeData.tipo) && (
                  <option value={attributeData.tipo}>{attributeData.tipo}</option>
                )}
              </select>
              <input
                type="text"
                placeholder="O ingresa otro tipo..."
                value={attributeData.tipoCustom || ''}
                onChange={(e) => {
                  onAttributeChange && onAttributeChange('tipoCustom', e.target.value);
                  onAttributeChange && onAttributeChange('tipo', e.target.value);
                }}
                className="custom-input-small"
              />
            </div>
          </div>

          {/* Ancho superior e inferior */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="anchoSuperior">Ancho Superior:</label>
              <select 
                id="anchoSuperior"
                name="anchoSuperior"
                value={attributeData.anchoSuperior || ''}
                onChange={(e) => onAttributeChange && onAttributeChange('anchoSuperior', e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="Ancho">Ancho</option>
                <option value="Medio">Medio</option>
                <option value="Angosto">Angosto</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="anchoInferior">Ancho Inferior:</label>
              <select 
                id="anchoInferior"
                name="anchoInferior"
                value={attributeData.anchoInferior || ''}
                onChange={(e) => onAttributeChange && onAttributeChange('anchoInferior', e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="Ancho">Ancho</option>
                <option value="Medio">Medio</option>
                <option value="Angosto">Angosto</option>
              </select>
            </div>
          </div>

          {/* Virola */}
          <div className="form-row">
            <div className="form-group">
              <label>¿Tiene Virola?</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="virola"
                  checked={attributeData.virola === 'Si' || attributeData.virola === true}
                  onChange={(e) => onAttributeChange && onAttributeChange('virola', e.target.checked ? 'Si' : 'No')}
                />
                <label htmlFor="virola" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-btn"></span>
                </label>
                <span className="toggle-text">
                  {attributeData.virola === 'Si' || attributeData.virola === true ? 'Sí' : 'No'}
                </span>
              </div>
            </div>

            {/* Tipos de virola - solo si tiene virola */}
            {(attributeData.virola === 'Si' || attributeData.virola === true) && (
              <div className="form-group">
                <label htmlFor="tiposDeVirola">Tipo de Virola:</label>
                <select 
                  id="tiposDeVirola"
                  name="tiposDeVirola"
                  value={attributeData.tiposDeVirola || ''}
                  onChange={(e) => onAttributeChange && onAttributeChange('tiposDeVirola', e.target.value)}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Acero">Acero</option>
                  <option value="Alpaca">Alpaca</option>
                  <option value="Bronce">Bronce</option>
                  {attributeData.tiposDeVirola && !['Acero', 'Alpaca', 'Bronce'].includes(attributeData.tiposDeVirola) && (
                    <option value={attributeData.tiposDeVirola}>{attributeData.tiposDeVirola}</option>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="O ingresa otro tipo..."
                  value={attributeData.tiposDeVirolaCustom || ''}
                  onChange={(e) => {
                    onAttributeChange && onAttributeChange('tiposDeVirolaCustom', e.target.value);
                    onAttributeChange && onAttributeChange('tiposDeVirola', e.target.value);
                  }}
                  className="custom-input-small"
                />
              </div>
            )}
          </div>

          {/* Guarda */}
          <div className="form-row">
            <div className="form-group">
              <label>¿Tiene Guarda?</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="guarda"
                  checked={attributeData.guarda === 'Si' || attributeData.guarda === true}
                  onChange={(e) => onAttributeChange && onAttributeChange('guarda', e.target.checked ? 'Si' : 'No')}
                />
                <label htmlFor="guarda" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-btn"></span>
                </label>
                <span className="toggle-text">
                  {attributeData.guarda === 'Si' || attributeData.guarda === true ? 'Sí' : 'No'}
                </span>
              </div>
            </div>

            {/* Tipos de guarda - solo si tiene guarda */}
            {(attributeData.guarda === 'Si' || attributeData.guarda === true) && (
              <div className="form-group">
                <label htmlFor="tiposDeGuarda">Tipo de Guarda:</label>
                <select 
                  id="tiposDeGuarda"
                  name="tiposDeGuarda"
                  value={attributeData.tiposDeGuarda || ''}
                  onChange={(e) => onAttributeChange && onAttributeChange('tiposDeGuarda', e.target.value)}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Acero">Acero</option>
                  <option value="Alpaca">Alpaca</option>
                  <option value="Bronce">Bronce</option>
                  {attributeData.tiposDeGuarda && !['Acero', 'Alpaca', 'Bronce'].includes(attributeData.tiposDeGuarda) && (
                    <option value={attributeData.tiposDeGuarda}>{attributeData.tiposDeGuarda}</option>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="O ingresa otro tipo..."
                  value={attributeData.tiposDeGuardaCustom || ''}
                  onChange={(e) => {
                    onAttributeChange && onAttributeChange('tiposDeGuardaCustom', e.target.value);
                    onAttributeChange && onAttributeChange('tiposDeGuarda', e.target.value);
                  }}
                  className="custom-input-small"
                />
              </div>
            )}
          </div>

          {/* Revestimiento */}
          <div className="form-row">
            <div className="form-group">
              <label>¿Tiene Revestimiento?</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="revestimiento"
                  checked={attributeData.revestimiento === 'Si' || attributeData.revestimiento === true}
                  onChange={(e) => onAttributeChange && onAttributeChange('revestimiento', e.target.checked ? 'Si' : 'No')}
                />
                <label htmlFor="revestimiento" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-btn"></span>
                </label>
                <span className="toggle-text">
                  {attributeData.revestimiento === 'Si' || attributeData.revestimiento === true ? 'Sí' : 'No'}
                </span>
              </div>
            </div>

            {/* Tipos de revestimiento - solo si tiene revestimiento */}
            {(attributeData.revestimiento === 'Si' || attributeData.revestimiento === true) && (
              <div className="form-group">
                <label htmlFor="tiposDeRevestimientos">Tipo de Revestimiento:</label>
                <select 
                  id="tiposDeRevestimientos"
                  name="tiposDeRevestimientos"
                  value={attributeData.tiposDeRevestimientos || ''}
                  onChange={(e) => onAttributeChange && onAttributeChange('tiposDeRevestimientos', e.target.value)}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Cuero natural">Cuero natural</option>
                  <option value="Alpaca">Alpaca</option>
                  {attributeData.tiposDeRevestimientos && !['Cuero natural', 'Alpaca'].includes(attributeData.tiposDeRevestimientos) && (
                    <option value={attributeData.tiposDeRevestimientos}>{attributeData.tiposDeRevestimientos}</option>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="O ingresa otro tipo..."
                  value={attributeData.tiposDeRevestimientosCustom || ''}
                  onChange={(e) => {
                    onAttributeChange && onAttributeChange('tiposDeRevestimientosCustom', e.target.value);
                    onAttributeChange && onAttributeChange('tiposDeRevestimientos', e.target.value);
                  }}
                  className="custom-input-small"
                />
              </div>
            )}
          </div>

          {/* Curados */}
          <div className="form-row">
            <div className="form-group">
              <label>¿Tiene Curado?</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="curados"
                  checked={attributeData.curados === 'Si' || attributeData.curados === true}
                  onChange={(e) => onAttributeChange && onAttributeChange('curados', e.target.checked ? 'Si' : 'No')}
                />
                <label htmlFor="curados" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-btn"></span>
                </label>
                <span className="toggle-text">
                  {attributeData.curados === 'Si' || attributeData.curados === true ? 'Sí' : 'No'}
                </span>
              </div>
            </div>

            {/* Tipos de curados - solo si tiene curado */}
            {(attributeData.curados === 'Si' || attributeData.curados === true) && (
              <div className="form-group">
                <label htmlFor="tiposDeCurados">Tipo de Curado:</label>
                <select 
                  id="tiposDeCurados"
                  name="tiposDeCurados"
                  value={attributeData.tiposDeCurados || ''}
                  onChange={(e) => onAttributeChange && onAttributeChange('tiposDeCurados', e.target.value)}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Curado de calabaza">Curado de calabaza</option>
                  <option value="Curado de alpaca">Curado de alpaca</option>
                  {attributeData.tiposDeCurados && !['Curado de calabaza', 'Curado de alpaca'].includes(attributeData.tiposDeCurados) && (
                    <option value={attributeData.tiposDeCurados}>{attributeData.tiposDeCurados}</option>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="O ingresa otro tipo..."
                  value={attributeData.tiposDeCuradosCustom || ''}
                  onChange={(e) => {
                    onAttributeChange && onAttributeChange('tiposDeCuradosCustom', e.target.value);
                    onAttributeChange && onAttributeChange('tiposDeCurados', e.target.value);
                  }}
                  className="custom-input-small"
                />
              </div>
            )}
          </div>

          {/* Sección Adicional */}
          <div className="form-section-subtitle">
            <h4>Adicional</h4>
          </div>

          {/* Terminación */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="terminacion">Terminación:</label>
              <select 
                id="terminacion"
                name="terminacion"
                value={attributeData.terminacion || ''}
                onChange={(e) => onAttributeChange && onAttributeChange('terminacion', e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="Brillante">Brillante</option>
                {attributeData.terminacion && attributeData.terminacion !== 'Brillante' && (
                  <option value={attributeData.terminacion}>{attributeData.terminacion}</option>
                )}
              </select>
              <input
                type="text"
                placeholder="O ingresa otra terminación..."
                value={attributeData.terminacionCustom || ''}
                onChange={(e) => {
                  onAttributeChange && onAttributeChange('terminacionCustom', e.target.value);
                  onAttributeChange && onAttributeChange('terminacion', e.target.value);
                }}
                className="custom-input-small"
              />
            </div>

            {/* Grabado */}
            <div className="form-group">
              <label>¿Tiene Grabado?</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="grabado"
                  checked={attributeData.grabado === 'Si' || attributeData.grabado === true}
                  onChange={(e) => onAttributeChange && onAttributeChange('grabado', e.target.checked ? 'Si' : 'No')}
                />
                <label htmlFor="grabado" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-btn"></span>
                </label>
                <span className="toggle-text">
                  {attributeData.grabado === 'Si' || attributeData.grabado === true ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción del grabado - solo si tiene grabado */}
          {(attributeData.grabado === 'Si' || attributeData.grabado === true) && (
            <div className="form-group">
              <label htmlFor="descripcionDelGrabado">Descripción del Grabado:</label>
              <textarea
                id="descripcionDelGrabado"
                name="descripcionDelGrabado"
                value={attributeData.descripcionDelGrabado || ''}
                onChange={(e) => onAttributeChange && onAttributeChange('descripcionDelGrabado', e.target.value)}
                placeholder="Describe el grabado..."
                rows="3"
              />
            </div>
          )}

          {/* Color */}
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={attributeData.color || ''}
              onChange={(e) => onAttributeChange && onAttributeChange('color', e.target.value)}
              placeholder="Opciones de colores disponibles..."
            />
            <small className="field-help">Puedes ingresar múltiples colores separados por comas</small>
          </div>
        </div>
      )}

      {/* Atributos específicos para otras categorías */}
      {formData.catalogo && formData.catalogo?.toLowerCase() !== 'combos' && formData.catalogo?.toLowerCase() !== 'mate' && formData.catalogo?.toLowerCase() !== 'mates' && availableAttributes && Object.keys(availableAttributes).length > 0 && (
        <div className="form-section">
          <h3>Atributos Específicos</h3>
          <div className="attributes-grid">
            {Object.entries(availableAttributes).map(([attrName, values]) => (
              <div key={attrName} className="form-group">
                <label htmlFor={attrName}>{getAttributeLabel(attrName)}:</label>
                <select 
                  id={attrName}
                  name={attrName}
                  value={attributeData[attrName] || ''}
                  onChange={(e) => onAttributeChange && onAttributeChange(attrName, e.target.value)}
                >
                  <option value="">Seleccionar {getAttributeLabel(attrName).toLowerCase()}</option>
                  {values.map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-section">
        <h3>Imágenes</h3>
        
        <div className="form-group">
          <label htmlFor="imagenes">Subir Imágenes</label>
          <input
            type="file"
            id="imagenes"
            name="imagenes"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="file-input"
          />
        </div>

        {formData.imagenes && formData.imagenes.length > 0 && (
          <div className="image-preview-container">
            <h4>Imágenes Subidas:</h4>
            <div className="image-preview-grid">
              {formData.imagenes.map((imagen, index) => (
                <div key={index} className="image-preview-item">
                  <img src={imagen} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => onImageRemove(index)}
                    title="Eliminar imagen"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions-item-form">
        <button type="button" onClick={onPreview} className="preview-btn-item-form">
          Vista Previa
        </button>
        <button type="submit" className="submit-btn-item-form">
          Agregar Producto
        </button>
      </div>
    </form>
  );
}

export default SimpleItemForm;