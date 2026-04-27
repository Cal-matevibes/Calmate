import React, { useState, useEffect } from 'react';
import '../styles/EditItemModal.css';

function EditItemModal({ 
  item, 
  isOpen, 
  onClose, 
  onSave,
  categories = []
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioVenta: '',
    stock: 0,
    categoria: '',
    imagenes: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  // Cargar datos del item cuando se abre el modal
  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        precioVenta: item.precioVenta || '',
        stock: item.stock || 0,
        categoria: item.categoria || '',
        imagenes: item.imagenes || []
      });
      setErrors({});
      setNewImageFile(null);
      setNewImagePreview(null);
    }
  }, [item, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.precioVenta || formData.precioVenta <= 0) {
      newErrors.precioVenta = 'El precio debe ser mayor a 0';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Preparar datos del item
      const updatedItem = {
        ...item,
        ...formData,
        precioVenta: parseFloat(formData.precioVenta),
        stock: parseInt(formData.stock)
      };

      // Separar imágenes existentes y nuevas
      const existingImages = formData.imagenes.filter(img => !img.isNew);
      const newImages = formData.imagenes.filter(img => img.isNew);

      // Si hay nuevas imágenes, necesitamos procesarlas
      if (newImages.length > 0) {
        // Convertir archivos a base64 para el backend
        const processedNewImages = await Promise.all(
          newImages.map(async (img) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  url: e.target.result, // Base64
                  alt: img.alt,
                  isNew: true
                });
              };
              reader.readAsDataURL(img.file);
            });
          })
        );

        // Combinar imágenes existentes con las nuevas procesadas
        updatedItem.imagenes = [...existingImages, ...processedNewImages];
      } else {
        // Solo imágenes existentes
        updatedItem.imagenes = existingImages;
      }
      
      await onSave(updatedItem);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ submit: 'Error al guardar los cambios' });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar nueva imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'La imagen no puede superar los 5MB'
        }));
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'El archivo debe ser una imagen'
        }));
        return;
      }

      setNewImageFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error de imagen
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  // Agregar nueva imagen al array
  const handleAddImage = () => {
    if (!newImageFile || !newImagePreview) return;

    const newImage = {
      url: newImagePreview, // Base64 para preview, se convertirá en el backend
      alt: `${formData.nombre} - Imagen ${formData.imagenes.length + 1}`,
      isNew: true, // Marcador para el backend
      file: newImageFile // Archivo para el backend
    };

    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, newImage]
    }));

    // Limpiar selección
    setNewImageFile(null);
    setNewImagePreview(null);
    
    // Limpiar input
    const fileInput = document.getElementById('new-image');
    if (fileInput) fileInput.value = '';
  };

  // Eliminar imagen del array
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  const handleCancel = () => {
    onClose();
    setErrors({});
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h2>Editar Item</h2>
          <button 
            className="close-btn"
            onClick={handleCancel}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={errors.nombre ? 'error' : ''}
                placeholder="Nombre del producto"
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className={errors.descripcion ? 'error' : ''}
              placeholder="Descripción del producto"
              rows="3"
            />
            {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precioVenta">Precio de Venta *</label>
              <input
                type="number"
                id="precioVenta"
                name="precioVenta"
                value={formData.precioVenta}
                onChange={handleInputChange}
                className={errors.precioVenta ? 'error' : ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.precioVenta && <span className="error-message">{errors.precioVenta}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className={errors.stock ? 'error' : ''}
                placeholder="0"
                min="0"
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
          </div>

          {/* Sección de Imágenes */}
          <div className="images-section">
            <h3>Imágenes del Producto</h3>
            
            {/* Imágenes existentes */}
            <div className="existing-images">
              {formData.imagenes.length > 0 ? (
                <div className="images-grid">
                  {formData.imagenes.map((imagen, index) => (
                    <div key={index} className="image-item">
                      <div className="image-preview-container">
                        <img 
                          src={imagen.url} 
                          alt={imagen.alt || `Imagen ${index + 1}`}
                          className="image-thumbnail"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="remove-image-btn"
                          title="Eliminar imagen"
                        >
                          ✕
                        </button>
                        <div className="image-index">{index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-images">
                  <p>No hay imágenes agregadas</p>
                </div>
              )}
            </div>

            {/* Agregar nueva imagen */}
            <div className="add-image-section">
              <h4>Agregar Nueva Imagen</h4>
              <div className="add-image-form">
                <div className="image-input-group">
                  <input
                    type="file"
                    id="new-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                  />
                  <label htmlFor="new-image" className="image-input-label">
                    📷 Seleccionar Imagen
                  </label>
                </div>
                
                {newImagePreview && (
                  <div className="new-image-preview">
                    <img 
                      src={newImagePreview} 
                      alt="Preview"
                      className="preview-thumbnail"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="add-image-btn"
                    >
                      ➕ Agregar
                    </button>
                  </div>
                )}
              </div>
              
              {errors.image && (
                <span className="error-message">{errors.image}</span>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn-cancel"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditItemModal;