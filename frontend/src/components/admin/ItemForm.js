import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/ItemForm.css';

function ItemForm({ onSubmit, mates = [], bombillas = [], editingProduct = null }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    // Características para mates
    caracteristicasMates: {
      forma: '',
      tipo: '',
      anchoSuperior: '',
      anchoInferior: '',
      virola: '',
      tiposDeVirola: '',
      guarda: '',
      tiposDeGuarda: '',
      revestimiento: '',
      tiposDeRevestimientos: '',
      curados: '',
      tiposDeCurados: '',
      terminacion: '',
      grabado: '',
      descripcionDelGrabado: '',
      color: ''
    },
    // Características para bombillas
    caracteristicasBombillas: {
      forma: '',
      tipoMaterial: '',
      tamaño: '',
      centimetros: ''
    },
    // Características para combos
    caracteristicasCombos: {
      mate: '',
      bombilla: ''
    },
    // Campos comunes
    stock: '',
    precioCompra: '',
    precioVenta: '',
    descripcion: '',
    imagenes: [],
    activo: true
  });

  // Opciones para cada campo según el modelo del backend
  const opcionesCampos = {
    mates: {
      forma: ['Camionero', 'Imperial', 'Torpedo'],
      tipo: ['Calabaza', 'Algarrobo'],
      anchoSuperior: ['Ancho', 'Medio', 'Angosto'],
      anchoInferior: ['Ancho', 'Medio', 'Angosto'],
      virola: ['Si', 'No'],
      tiposDeVirola: ['Acero', 'Alpaca', 'Bronce', 'ETC'],
      guarda: ['Si', 'No'],
      tiposDeGuarda: ['Acero', 'Alpaca', 'Bronce', 'ETC'],
      revestimiento: ['Si', 'No'],
      tiposDeRevestimientos: ['Cuero natural', 'Alpaca'],
      curados: ['Si', 'No'],
      tiposDeCurados: ['Curado de calabaza', 'Curado de alpaca'],
      terminacion: ['Brillante', 'ETC'],
      grabado: ['Si', 'No']
    },
    bombillas: {
      tamaño: ['Larga', 'Mediana', 'Pequeña']
    }
  };

  const [stockCombo, setStockCombo] = useState(0);

  // Efecto para poblar datos si estamos editando
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        nombre: editingProduct.nombre || '',
        categoria: editingProduct.categoria || '',
        caracteristicasMates: editingProduct.caracteristicasMates || {
          forma: '', tipo: '', anchoSuperior: '', anchoInferior: '',
          virola: '', tiposDeVirola: '', guarda: '', tiposDeGuarda: '',
          revestimiento: '', tiposDeRevestimientos: '', curados: '',
          tiposDeCurados: '', terminacion: '', grabado: '',
          descripcionDelGrabado: '', color: ''
        },
        caracteristicasBombillas: editingProduct.caracteristicasBombillas || {
          forma: '', tipoMaterial: '', tamaño: '', centimetros: ''
        },
        caracteristicasCombos: editingProduct.caracteristicasCombos || {
          mate: '', bombilla: ''
        },
        stock: editingProduct.stock || '',
        precioCompra: editingProduct.precioCompra || '',
        precioVenta: editingProduct.precioVenta || '',
        descripcion: editingProduct.descripcion || '',
        imagenes: [],
        activo: editingProduct.activo !== undefined ? editingProduct.activo : true
      });
    }
  }, [editingProduct]);

  // Calcular stock del combo
  useEffect(() => {
    if (formData.categoria === 'combos' && 
        formData.caracteristicasCombos.mate && 
        formData.caracteristicasCombos.bombilla) {
      
      const mateSeleccionado = mates.find(m => m._id === formData.caracteristicasCombos.mate);
      const bombillaSeleccionada = bombillas.find(b => b._id === formData.caracteristicasCombos.bombilla);
      
      if (mateSeleccionado && bombillaSeleccionada) {
        const stockCalculado = Math.min(mateSeleccionado.stock, bombillaSeleccionada.stock);
        setStockCombo(stockCalculado);
        
        // Actualizar el stock automáticamente para combos
        setFormData(prev => ({
          ...prev,
          stock: stockCalculado
        }));
      }
    }
  }, [formData.caracteristicasCombos.mate, formData.caracteristicasCombos.bombilla, mates, bombillas, formData.categoria]);

  // Manejar cambios en campos comunes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // Manejar cambios en características de mates
  const handleMateFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      caracteristicasMates: {
        ...prev.caracteristicasMates,
        [field]: value
      }
    }));
  };

  // Manejar cambios en características de bombillas
  const handleBombillaFieldChange = (field, value) => {
    const finalValue = field === 'centimetros' ? (value === '' ? '' : Number(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      caracteristicasBombillas: {
        ...prev.caracteristicasBombillas,
        [field]: finalValue
      }
    }));
  };

  // Manejar cambios en características de combos
  const handleComboFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      caracteristicasCombos: {
        ...prev.caracteristicasCombos,
        [field]: value
      }
    }));
  };

  // Manejar selección de imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...files]
    }));
  };

  // Eliminar imagen
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  // Renderizar campos para mates
  const renderMateFields = () => (
    <div className="mate-fields">
      <h3>Características del Mate</h3>
      
      <label>
        Forma:
        <select
          value={formData.caracteristicasMates.forma}
          onChange={(e) => handleMateFieldChange('forma', e.target.value)}
          required
        >
          <option value="">Seleccione una forma</option>
          {opcionesCampos.mates.forma.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label>
        Tipo:
        <select
          value={formData.caracteristicasMates.tipo}
          onChange={(e) => handleMateFieldChange('tipo', e.target.value)}
          required
        >
          <option value="">Seleccione un tipo</option>
          {opcionesCampos.mates.tipo.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label>
        Ancho Superior:
        <select
          value={formData.caracteristicasMates.anchoSuperior}
          onChange={(e) => handleMateFieldChange('anchoSuperior', e.target.value)}
          required
        >
          <option value="">Seleccione ancho superior</option>
          {opcionesCampos.mates.anchoSuperior.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label>
        Ancho Inferior:
        <select
          value={formData.caracteristicasMates.anchoInferior}
          onChange={(e) => handleMateFieldChange('anchoInferior', e.target.value)}
          required
        >
          <option value="">Seleccione ancho inferior</option>
          {opcionesCampos.mates.anchoInferior.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label>
        Virola:
        <select
          value={formData.caracteristicasMates.virola}
          onChange={(e) => handleMateFieldChange('virola', e.target.value)}
          required
        >
          <option value="">¿Tiene virola?</option>
          {opcionesCampos.mates.virola.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      {formData.caracteristicasMates.virola === 'Si' && (
        <label>
          Tipos de Virola:
          <select
            value={formData.caracteristicasMates.tiposDeVirola}
            onChange={(e) => handleMateFieldChange('tiposDeVirola', e.target.value)}
            required
          >
            <option value="">Seleccione tipo de virola</option>
            {opcionesCampos.mates.tiposDeVirola.map(opcion => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Guarda:
        <select
          value={formData.caracteristicasMates.guarda}
          onChange={(e) => handleMateFieldChange('guarda', e.target.value)}
          required
        >
          <option value="">¿Tiene guarda?</option>
          {opcionesCampos.mates.guarda.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      {formData.caracteristicasMates.guarda === 'Si' && (
        <label>
          Tipos de Guarda:
          <select
            value={formData.caracteristicasMates.tiposDeGuarda}
            onChange={(e) => handleMateFieldChange('tiposDeGuarda', e.target.value)}
            required
          >
            <option value="">Seleccione tipo de guarda</option>
            {opcionesCampos.mates.tiposDeGuarda.map(opcion => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Revestimiento:
        <select
          value={formData.caracteristicasMates.revestimiento}
          onChange={(e) => handleMateFieldChange('revestimiento', e.target.value)}
          required
        >
          <option value="">¿Tiene revestimiento?</option>
          {opcionesCampos.mates.revestimiento.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      {formData.caracteristicasMates.revestimiento === 'Si' && (
        <label>
          Tipos de Revestimientos:
          <select
            value={formData.caracteristicasMates.tiposDeRevestimientos}
            onChange={(e) => handleMateFieldChange('tiposDeRevestimientos', e.target.value)}
            required
          >
            <option value="">Seleccione tipo de revestimiento</option>
            {opcionesCampos.mates.tiposDeRevestimientos.map(opcion => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Curados:
        <select
          value={formData.caracteristicasMates.curados}
          onChange={(e) => handleMateFieldChange('curados', e.target.value)}
          required
        >
          <option value="">¿Está curado?</option>
          {opcionesCampos.mates.curados.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      {formData.caracteristicasMates.curados === 'Si' && (
        <label>
          Tipos de Curados:
          <select
            value={formData.caracteristicasMates.tiposDeCurados}
            onChange={(e) => handleMateFieldChange('tiposDeCurados', e.target.value)}
            required
          >
            <option value="">Seleccione tipo de curado</option>
            {opcionesCampos.mates.tiposDeCurados.map(opcion => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Terminación:
        <select
          value={formData.caracteristicasMates.terminacion}
          onChange={(e) => handleMateFieldChange('terminacion', e.target.value)}
        >
          <option value="">Seleccione terminación</option>
          {opcionesCampos.mates.terminacion.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label>
        Grabado:
        <select
          value={formData.caracteristicasMates.grabado}
          onChange={(e) => handleMateFieldChange('grabado', e.target.value)}
          required
        >
          <option value="">¿Tiene grabado?</option>
          {opcionesCampos.mates.grabado.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      {formData.caracteristicasMates.grabado === 'Si' && (
        <label>
          Descripción del Grabado:
          <textarea
            value={formData.caracteristicasMates.descripcionDelGrabado}
            onChange={(e) => handleMateFieldChange('descripcionDelGrabado', e.target.value)}
            placeholder="Describe el grabado..."
            required
          />
        </label>
      )}

      <label>
        Color:
        <input
          type="text"
          value={formData.caracteristicasMates.color}
          onChange={(e) => handleMateFieldChange('color', e.target.value)}
          placeholder="Ej: Marrón natural, Negro, etc."
        />
      </label>
    </div>
  );

  // Renderizar campos para bombillas
  const renderBombillaFields = () => (
    <div className="bombilla-fields">
      <h3>Características de la Bombilla</h3>
      
      <label>
        Forma:
        <input
          type="text"
          value={formData.caracteristicasBombillas.forma}
          onChange={(e) => handleBombillaFieldChange('forma', e.target.value)}
          placeholder="Ej: Recta, Curva, etc."
          required
        />
      </label>

      <label>
        Tipo/Material:
        <input
          type="text"
          value={formData.caracteristicasBombillas.tipoMaterial}
          onChange={(e) => handleBombillaFieldChange('tipoMaterial', e.target.value)}
          placeholder="Ej: Acero inoxidable, Alpaca, etc."
          required
        />
      </label>

      <label>
        Tamaño:
        <select
          value={formData.caracteristicasBombillas.tamaño}
          onChange={(e) => handleBombillaFieldChange('tamaño', e.target.value)}
          required
        >
          <option value="">Seleccione un tamaño</option>
          {opcionesCampos.bombillas.tamaño.map(opcion => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label>
        Centímetros:
        <input
          type="number"
          min="1"
          max="50"
          value={formData.caracteristicasBombillas.centimetros}
          onChange={(e) => handleBombillaFieldChange('centimetros', e.target.value)}
          placeholder="Longitud en cm"
        />
      </label>
    </div>
  );

  // Renderizar campos para combos
  const renderComboFields = () => (
    <div className="combo-fields">
      <h3>Características del Combo</h3>
      
      <label>
        Mate:
        <select
          value={formData.caracteristicasCombos.mate}
          onChange={(e) => handleComboFieldChange('mate', e.target.value)}
          required
        >
          <option value="">Seleccione un mate</option>
          {mates.filter(mate => mate.activo).map(mate => (
            <option key={mate._id} value={mate._id}>
              {mate.nombre} (Stock: {mate.stock})
            </option>
          ))}
        </select>
      </label>

      <label>
        Bombilla:
        <select
          value={formData.caracteristicasCombos.bombilla}
          onChange={(e) => handleComboFieldChange('bombilla', e.target.value)}
          required
        >
          <option value="">Seleccione una bombilla</option>
          {bombillas.filter(bombilla => bombilla.activo).map(bombilla => (
            <option key={bombilla._id} value={bombilla._id}>
              {bombilla.nombre} (Stock: {bombilla.stock})
            </option>
          ))}
        </select>
      </label>

      {formData.caracteristicasCombos.mate && formData.caracteristicasCombos.bombilla && (
        <div className="combo-info">
          <p><strong>Stock calculado del combo: {stockCombo}</strong></p>
          {stockCombo === 0 && (
            <p className="warning">⚠️ Sin stock disponible para este combo</p>
          )}
        </div>
      )}
    </div>
  );

  // Renderizar campos según categoría
  const renderCategoryFields = () => {
    switch (formData.categoria) {
      case 'mates':
        return renderMateFields();
      case 'bombillas':
        return renderBombillaFields();
      case 'combos':
        return renderComboFields();
      default:
        return null;
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.categoria || !formData.precioVenta) {
      alert('Nombre, categoría y precio de venta son obligatorios.');
      return;
    }

    // Preparar datos según el modelo del backend
    const dataToSubmit = {
      nombre: formData.nombre,
      categoria: formData.categoria,
      stock: formData.stock || 0,
      precioCompra: formData.precioCompra || 0,
      precioVenta: formData.precioVenta,
      descripcion: formData.descripcion,
      activo: formData.activo
    };

    // Agregar características según la categoría
    if (formData.categoria === 'mates') {
      dataToSubmit.caracteristicasMates = formData.caracteristicasMates;
    } else if (formData.categoria === 'bombillas') {
      dataToSubmit.caracteristicasBombillas = formData.caracteristicasBombillas;
    } else if (formData.categoria === 'combos') {
      dataToSubmit.caracteristicasCombos = formData.caracteristicasCombos;
    }

    // Agregar imágenes si las hay
    if (formData.imagenes.length > 0) {
      dataToSubmit.imagenes = formData.imagenes;
    }

    onSubmit(dataToSubmit);

    // Limpiar formulario
    setFormData({
      nombre: '',
      categoria: '',
      caracteristicasMates: {
        forma: '', tipo: '', anchoSuperior: '', anchoInferior: '',
        virola: '', tiposDeVirola: '', guarda: '', tiposDeGuarda: '',
        revestimiento: '', tiposDeRevestimientos: '', curados: '',
        tiposDeCurados: '', terminacion: '', grabado: '',
        descripcionDelGrabado: '', color: ''
      },
      caracteristicasBombillas: {
        forma: '', tipoMaterial: '', tamaño: '', centimetros: ''
      },
      caracteristicasCombos: {
        mate: '', bombilla: ''
      },
      stock: '',
      precioCompra: '',
      precioVenta: '',
      descripcion: '',
      imagenes: [],
      activo: true
    });
  };

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <h2>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>

      {/* Campos comunes */}
      <div className="common-fields">
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Categoría:
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            required
            disabled={editingProduct} // No permitir cambiar categoría al editar
          >
            <option value="">Seleccione una categoría</option>
            <option value="mates">Mates</option>
            <option value="bombillas">Bombillas</option>
            <option value="combos">Combos</option>
          </select>
        </label>

        <label>
          Stock:
          <input
            type="number"
            name="stock"
            min="0"
            value={formData.stock}
            onChange={handleInputChange}
            disabled={formData.categoria === 'combos'} // Auto-calculado para combos
          />
        </label>

        <label>
          Precio de Compra:
          <input
            type="number"
            name="precioCompra"
            min="0"
            step="0.01"
            value={formData.precioCompra}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Precio de Venta:
          <input
            type="number"
            name="precioVenta"
            min="0"
            step="0.01"
            value={formData.precioVenta}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Descripción:
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción del producto..."
          />
        </label>

        <label>
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
          />
          Producto activo
        </label>
      </div>

      {/* Campos específicos por categoría */}
      {renderCategoryFields()}

      {/* Campo para imágenes */}
      <div className="image-section">
        <label>
          Imágenes:
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {/* Vista previa de imágenes */}
        {formData.imagenes.length > 0 && (
          <div className="image-preview">
            {formData.imagenes.map((imagen, index) => (
              <div key={index} className="image-container">
                <img
                  src={URL.createObjectURL(imagen)}
                  alt={`Preview ${index + 1}`}
                  className="preview-image"
                />
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={() => handleRemoveImage(index)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de envío */}
      <button type="submit" className="submit-button">
        {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
      </button>
    </form>
  );
}

export default ItemForm;