import React, { useState, useEffect } from 'react';
import SimpleItemForm from './SimpleItemForm';
import '../styles/AddItemModal.css';


function AddItemModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  catalogos = []
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioVenta: '',
    stock: 0,
    imagenes: [],
    catalogo: ''
  });
  
  const [attributeData, setAttributeData] = useState({});

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        precioVenta: '',
        stock: 0,
        imagenes: [],
        catalogo: ''
      });
      setAttributeData({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      // Validar tamaño del archivo (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert(`La imagen ${file.name} es demasiado grande. Máximo 10MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData((prevData) => ({
          ...prevData,
          imagenes: [...prevData.imagenes, base64String],
        }));
      };
      
      reader.onerror = () => {
        alert(`Error al procesar la imagen ${file.name}`);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      imagenes: prevData.imagenes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar datos básicos
    if (!formData.nombre?.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }

    if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    
    // Validar categoría
    if (!formData.catalogo) {
      alert('Debe seleccionar una categoría');
      return;
    }

    // Validar que la categoría sea válida (usar categorías dinámicas)
    const validCategories = catalogos.map(cat => cat.nombre);
    
    if (!validCategories.includes(formData.catalogo)) {
      alert(`Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`);
      return;
    }

    // Validar y procesar imágenes
    const imagenesValidas = formData.imagenes.filter(img => 
      img && typeof img === 'string' && (img.startsWith('data:image/') || img.startsWith('http'))
    );
    
    let completeData = {
      ...formData,
      ...attributeData,
      imagenes: imagenesValidas,
      categoria: formData.catalogo, // Asegurar que ambos campos tengan el mismo valor
      precio: formData.precioVenta // Mapear precioVenta a precio
    };
    
    // Si es un combo, enriquecer la descripción con información de los productos seleccionados
    if (formData.catalogo?.toLowerCase() === 'combos') {
      const selectedProducts = [];
      const comboDetails = {};
      
      // Recopilar todos los productos seleccionados usando las nuevas claves dinámicas
      catalogos.forEach(categoria => {
        if (categoria.nombre?.toLowerCase() !== 'combos') {
          const categoryKey = `combo_${categoria.nombre}`;
          const selectedId = attributeData[categoryKey];
          if (selectedId && categoria.items) {
            const product = categoria.items.find(item => item.id === selectedId);
            if (product) {
              selectedProducts.push({
                ...product,
                categoria: categoria.nombre
              });
              comboDetails[categoria.nombre] = {
                id: product.id,
                nombre: product.nombre,
                precio: product.precioVenta
              };
            }
          }
        }
      });
      
      if (selectedProducts.length >= 2) {
        const quantity = attributeData.comboQuantity || 1;
        const productList = selectedProducts.map(p => `- ${quantity}x ${p.nombre}`).join('\n');
        const comboDescription = `${completeData.descripcion}${completeData.descripcion ? '\n\n' : ''}Incluye:\n${productList}`;
        
        completeData = {
          ...completeData,
          descripcion: comboDescription,
          comboDetails: {
            ...comboDetails,
            quantity: quantity
          }
        };
      }
    }
    
    // Verificar tamaño de los datos
    const dataSize = JSON.stringify(completeData).length;
    
    if (dataSize > 16 * 1024 * 1024) { // 16MB límite típico de Express
      alert('Los datos son demasiado grandes. Intenta con imágenes más pequeñas.');
      return;
    }
    
    try {
      onSubmit(completeData);
      onClose();
    } catch (error) {
      alert('Error al agregar el producto: ' + error.message);
    }
  };

  const handleCatalogChange = (e) => {
    const selectedCatalogId = e.target.value;
    setFormData(prev => ({
      ...prev,
      catalogo: selectedCatalogId
    }));
    // Limpiar atributos cuando cambia la categoría
    setAttributeData({});
  };
  
  // Obtener atributos disponibles para la categoría seleccionada
  const getAvailableAttributes = () => {
    if (!formData.catalogo || !catalogos) return {};
    
    const selectedCatalog = catalogos.find(cat => cat.nombre === formData.catalogo);
    if (!selectedCatalog || !selectedCatalog.items || selectedCatalog.items.length === 0) return {};
    
    const attributes = {};
    
    selectedCatalog.items.forEach(item => {
      Object.keys(item).forEach(key => {
        // Excluir campos que no son atributos filtrables
        if (['id', 'nombre', 'descripcion', 'imagen', 'imagenHover', 'stock', 'precioVenta', 'precioCosto', 'active', 'categoria', 'catalogoId'].includes(key)) {
          return;
        }
        
        const value = item[key];
        if (value !== undefined && value !== null && value !== '') {
          if (!attributes[key]) {
            attributes[key] = new Set();
          }
          // Si es booleano, convertir a string
          if (typeof value === 'boolean') {
            attributes[key].add(value ? 'Sí' : 'No');
          } else {
            attributes[key].add(String(value));
          }
        }
      });
    });
    
    // Convertir Sets a arrays ordenados
    const result = {};
    Object.keys(attributes).forEach(key => {
      result[key] = Array.from(attributes[key]).sort();
    });
    
    return result;
  };
  
  const handleAttributeChange = (attributeName, value) => {
    setAttributeData(prev => {
      const newData = {
        ...prev,
        [attributeName]: value
      };
      
      // Si es un combo, calcular precio sugerido dinámicamente con nuevas claves
      if (formData.catalogo?.toLowerCase() === 'combos') {
        // Obtener todos los productos seleccionados usando las nuevas claves dinámicas
        const selectedProducts = [];
        catalogos.forEach(categoria => {
          if (categoria.nombre?.toLowerCase() !== 'combos') {
            const categoryKey = `combo_${categoria.nombre}`;
            const selectedId = attributeName === categoryKey 
              ? value 
              : newData[categoryKey];
            
            if (selectedId && categoria.items) {
              const product = categoria.items.find(item => item.id === selectedId);
              if (product) {
                selectedProducts.push(product);
              }
            }
          }
        });
        
        // Si hay al menos 2 productos seleccionados, calcular precio
        if (selectedProducts.length >= 2) {
          const quantity = attributeName === 'comboQuantity' ? value : (newData.comboQuantity || 1);
          const totalIndividual = selectedProducts.reduce((sum, product) => sum + (product.precioVenta || 0), 0) * quantity;
          const suggestedPrice = Math.round(totalIndividual * 0.9 * 100) / 100; // 10% descuento, redondeado a centavos
          
          // Actualizar automáticamente el precio de venta
          setFormData(prevFormData => ({
            ...prevFormData,
            precioVenta: suggestedPrice.toString()
          }));
        }
      }
      
      return newData;
    });
  };

  const handlePreview = () => {
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-modal">
        <div className="add-modal-header">
          <h2>Agregar Nuevo Item</h2>
          <button className="add-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="add-modal-content">
          <SimpleItemForm
            formData={formData}
            attributeData={attributeData}
            onInputChange={handleInputChange}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onSubmit={handleSubmit}
            onPreview={handlePreview}
            catalogos={catalogos}
            onCatalogChange={handleCatalogChange}
            availableAttributes={getAvailableAttributes()}
            onAttributeChange={handleAttributeChange}
          />
        </div>
      </div>
    </div>
  );
}

export default AddItemModal;