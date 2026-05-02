import React, { useState, useEffect } from 'react';
import SimpleItemForm from './SimpleItemForm';
import '../styles/AddItemModal.css';

function EditItemModal({ 
  item, 
  isOpen, 
  onClose, 
  onSave,
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

  // Cargar datos del item cuando se abre el modal
  useEffect(() => {
    if (item && isOpen) {
      // Convertir imagenes a strings si son objetos {url, alt}
      const imagenesAsStrings = (item.imagenes || []).map(img =>
        typeof img === 'string' ? img : img?.url
      ).filter(Boolean);

      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        precioVenta: item.precioVenta || '',
        stock: item.stock || 0,
        imagenes: imagenesAsStrings,
        catalogo: item.categoria || ''
      });

      // Determinar las caracteristicas segun la categoria del producto
      const categoria = (item.categoria || '').toLowerCase();
      let attrs = {};
      if (categoria === 'mates' || categoria === 'mate') {
        attrs = { ...(item.caracteristicasMates || {}) };
      } else if (categoria === 'bombillas' || categoria === 'bombilla') {
        attrs = { ...(item.caracteristicasBombillas || {}) };
      } else {
        attrs = { ...(item.campos || {}) };
      }
      setAttributeData(attrs);
    }
  }, [item, isOpen]);

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
      if (file.size > 10 * 1024 * 1024) {
        alert(`La imagen ${file.name} es demasiado grande. Maximo 10MB.`);
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

    if (!formData.nombre?.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }

    if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    if (!formData.catalogo) {
      alert('Debe seleccionar una categoria');
      return;
    }

    const imagenesValidas = formData.imagenes.filter(img =>
      img && typeof img === 'string' && (img.startsWith('data:image/') || img.startsWith('http'))
    );

    const categoriaNorm = formData.catalogo?.toLowerCase();
    let updatedItem = {
      ...item,
      ...formData,
      imagenes: imagenesValidas,
      categoria: formData.catalogo,
      precio: formData.precioVenta
    };

    // Mapear attributeData al objeto de caracteristicas correcto segun categoria
    if (categoriaNorm === 'mates' || categoriaNorm === 'mate') {
      updatedItem.caracteristicasMates = { ...attributeData };
    } else if (categoriaNorm === 'bombillas' || categoriaNorm === 'bombilla') {
      updatedItem.caracteristicasBombillas = { ...attributeData };
    } else {
      updatedItem = { ...updatedItem, ...attributeData };
    }

    if (formData.catalogo?.toLowerCase() === 'combos') {
      const selectedProducts = [];
      const comboDetails = {};

      catalogos.forEach(categoria => {
        if (categoria.nombre?.toLowerCase() !== 'combos') {
          const categoryKey = `combo_${categoria.nombre}`;
          const selectedId = attributeData[categoryKey];
          if (selectedId && categoria.items) {
            const product = categoria.items.find(p => p.id === selectedId);
            if (product) {
              selectedProducts.push({ ...product, categoria: categoria.nombre });
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
        const comboDescription = `${updatedItem.descripcion}${updatedItem.descripcion ? '\n\n' : ''}Incluye:\n${productList}`;
        updatedItem = {
          ...updatedItem,
          descripcion: comboDescription,
          comboDetails: { ...comboDetails, quantity }
        };
      }
    }

    try {
      onSave(updatedItem);
      onClose();
    } catch (error) {
      alert('Error al guardar los cambios: ' + error.message);
    }
  };

  const handleCatalogChange = (e) => {
    const selectedCatalogId = e.target.value;
    setFormData(prev => ({
      ...prev,
      catalogo: selectedCatalogId
    }));
    setAttributeData({});
  };

  const getAvailableAttributes = () => {
    if (!formData.catalogo || !catalogos) return {};

    const selectedCatalog = catalogos.find(cat => cat.nombre == formData.catalogo);
    if (!selectedCatalog || !selectedCatalog.items || selectedCatalog.items.length == 0) return {};

    const attributes = {};

    selectedCatalog.items.forEach(it => {
      Object.keys(it).forEach(key => {
        if (['id', 'nombre', 'descripcion', 'imagen', 'imagenHover', 'stock', 'precioVenta', 'precioCosto', 'active', 'categoria', 'catalogoId'].includes(key)) {
          return;
        }
        const value = it[key];
        if (value !== undefined && value !== null && value !== '') {
          if (!attributes[key]) {
            attributes[key] = new Set();
          }
          if (typeof value === 'boolean') {
            attributes[key].add(value ? 'Si' : 'No');
          } else {
            attributes[key].add(String(value));
          }
        }
      });
    });

    const result = {};
    Object.keys(attributes).forEach(key => {
      result[key] = Array.from(attributes[key]).sort();
    });

    return result;
  };

  const handleAttributeChange = (attributeName, value) => {
    setAttributeData(prev => {
      const newData = { ...prev, [attributeName]: value };

      if (formData.catalogo?.toLowerCase() === 'combos') {
        const selectedProducts = [];
        catalogos.forEach(categoria => {
          if (categoria.nombre?.toLowerCase() !== 'combos') {
            const categoryKey = `combo_${categoria.nombre}`;
            const selectedId = attributeName === categoryKey ? value : newData[categoryKey];
            if (selectedId && categoria.items) {
              const product = categoria.items.find(p => p.id === selectedId);
              if (product) selectedProducts.push(product);
            }
          }
        });

        if (selectedProducts.length >= 2) {
          const quantity = attributeName === 'comboQuantity' ? value : (newData.comboQuantity || 1);
          const totalIndividual = selectedProducts.reduce((sum, p) => sum + (p.precioVenta || 0), 0) * quantity;
          const suggestedPrice = Math.round(totalIndividual * 0.9 * 100) / 100;
          setFormData(prevFormData => ({
            ...prevFormData,
            precioVenta: suggestedPrice.toString()
          }));
        }
      }

      return newData;
    });
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
          <h2>Editar Item</h2>
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
            onPreview={() => {}}
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

export default EditItemModal;
