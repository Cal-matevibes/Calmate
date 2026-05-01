import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OffersManager from './OffersManager';
import '../../components/styles/SimpleCategoryManager.css';
import '../styles/Tienda.css';

function SimpleCategoryManager({
  catalogos,
  onAddCatalogo,
  onEditCatalogo,
  onDeleteCatalogo,
  offers,
  setOffers
}) {
  const navigate = useNavigate();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState('');
  const [showOffersManager, setShowOffersManager] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewCategoryImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditCategoryImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const categoryData = {
        nombre: newCategoryName.trim(),
        imagen: newCategoryImage ? {
          url: newCategoryImage,
          alt: newCategoryName.trim()
        } : null
      };
      onAddCatalogo(categoryData);
      setNewCategoryName('');
      setNewCategoryImage('');
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.nombre);
    setEditCategoryImage(category.imagen?.url || '');
  };

  const handleSaveEdit = () => {
    if (editCategoryName.trim()) {
      // Encontrar la categoría actual para preservar su imagen si no hay una nueva
      const currentCategory = catalogos.find(cat => cat.id === editingCategory);

      const updatedData = {
        nombre: editCategoryName.trim(),
        imagen: editCategoryImage ? {
          url: editCategoryImage,
          alt: editCategoryName.trim()
        } : currentCategory?.imagen || null
      };
      onEditCatalogo(editingCategory, updatedData);
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryImage('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryImage('');
  };

  const handleCancelAdd = () => {
    setIsAddingCategory(false);
    setNewCategoryName('');
    setNewCategoryImage('');
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete && onDeleteCatalogo) {
      onDeleteCatalogo(categoryToDelete.id);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDeleteCategory = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="simple-category-manager">
      <div className="catalogos">
        {/* Botón para añadir nueva categoría - PRIMERO */}
        {isAddingCategory ? (
          <div className="add-category-modal" onClick={(e) => e.target === e.currentTarget && handleCancelAdd()}>
            <div className="add-category-form">
              <button
                className="modal-close-btn"
                onClick={handleCancelAdd}
                type="button"
              >
                ✕
              </button>
              <h3>Nueva Categoría</h3>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la nueva categoría"
                className="add-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') handleCancelAdd();
                }}
                autoFocus
              />
              <div className="image-input-container">
                <label htmlFor="new-category-image" className="image-input-label">
                  Agregar imagen
                </label>
                <input
                  type="file"
                  id="new-category-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
                {newCategoryImage && (
                  <div className="image-preview">
                    <img src={newCategoryImage} alt="Preview" className="preview-img" />
                  </div>
                )}
              </div>
              <div className="add-actions">
                <button
                  onClick={handleAddCategory}
                  className="btn-save-small"
                  disabled={!newCategoryName.trim()}
                >
                  ✓ Crear
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="btn-cancel-small"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="catalogo-card add-category-card"
            onClick={() => setIsAddingCategory(true)}
          >
            <div className="category-overlay"></div>
            <div className="add-category-content">
              <span className="add-icon">➕</span>
              <span className="add-text">Nueva Categoría</span>
            </div>
          </div>
        )}

        {/* Categoría especial de Ofertas */}
        <div className="catalogo-card offers-category">
          <div className="category-overlay"></div>
          <div className="category-actions-overlay">
            <button
              onClick={() => navigate('/manage-offers')}
              className="btn-edit-category-overlay"
              title="Gestionar ofertas"
            >
              ⚙️
            </button>
          </div>
          <h3 onClick={() => navigate('/manage-offers')} style={{ cursor: 'pointer' }}>
            🏷️ Ofertas
          </h3>
          <div className="category-count-overlay" onClick={() => navigate('/manage-offers')} style={{ cursor: 'pointer' }}>
            📊 {offers?.length || 0} ofertas
          </div>
        </div>

        {/* Categorías existentes */}
        {catalogos.map((categoria) => {
          return (
            <div key={categoria.id}>
              {editingCategory === categoria.id ? (
                <div className="edit-category-modal" onClick={(e) => e.target === e.currentTarget && handleCancelEdit()}>
                  <div className="edit-category-form">
                    <button
                      className="modal-close-btn"
                      onClick={handleCancelEdit}
                      type="button"
                    >
                      ✕
                    </button>

                    {/* Título */}
                    <h3>Editar Categoría</h3>

                    {/* Input del nombre */}
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="edit-input"
                      placeholder="Nombre de la categoría"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />

                    {/* Sección de imagen */}
                    <div className="image-input-container">
                      <div className="image-section-row">
                        {/* Imagen actual */}
                        {categoria.imagen?.url && !editCategoryImage && (
                          <div className="current-image-preview">
                            <p className="current-image-label">Imagen actual:</p>
                            <img src={categoria.imagen.url} alt={categoria.nombre} className="current-img" />
                          </div>
                        )}

                        {/* Nueva imagen */}
                        {editCategoryImage && (
                          <div className="image-preview">
                            <img src={editCategoryImage} alt="Preview" className="preview-img" />
                          </div>
                        )}

                        {/* Botón para cambiar imagen */}
                        <div>
                          <label htmlFor={`edit-image-${categoria.id}`} className="image-input-label">
                            {categoria.imagen?.url ? 'Cambiar imagen' : 'Agregar imagen'}
                          </label>
                          <input
                            type="file"
                            id={`edit-image-${categoria.id}`}
                            accept="image/*"
                            onChange={handleEditImageChange}
                            className="image-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="edit-actions">
                      <button
                        onClick={handleCancelEdit}
                        className="btn-cancel-small"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="btn-save-small"
                      >
                        Guardar
                      </button>                      
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="catalogo-card category-admin-card"
                  style={categoria.imagen?.url ? {
                    backgroundImage: `url(${categoria.imagen.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  } : {
                    background: 'linear-gradient(45deg, rgba(183, 199, 116, 0.2), rgba(82, 105, 26, 0.2))'
                  }}
                >
                  <div className="category-overlay"></div>
                  <div className="category-actions-overlay">
                    <button
                      onClick={() => handleEditCategory(categoria)}
                      className="btn-edit-category-overlay"
                      title="Editar categoría"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(categoria)}
                      className="btn-delete-category-overlay"
                      title="Eliminar categoría"
                    >
                      🗑️
                    </button>
                  </div>
                  <h3>{categoria.nombre}</h3>
                  <div className="category-count-overlay">
                    📦 {categoria.items?.length || 0} items
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Modal de gestión de ofertas */}
      {showOffersManager && (
        <div className="offers-modal-overlay">
          <div className="offers-modal">
            <div className="offers-modal-header">
              <h2>🏷️ Gestión de Ofertas</h2>
              <button
                className="close-offers-modal"
                onClick={() => setShowOffersManager(false)}
              >
                ✕
              </button>
            </div>
            <div className="offers-modal-content">
              <OffersManager
                offers={offers}
                setOffers={setOffers}
                catalogos={catalogos}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>⚠️ Confirmar Eliminación</h3>
            </div>
            <div className="delete-confirm-content">
              <p>
                ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoryToDelete.nombre}"</strong>?
              </p>
              <p className="delete-warning">
                ❌ Esta acción eliminará permanentemente:
              </p>
              <ul className="delete-items-list">
                <li>La categoría completa</li>
                <li>Todos los {categoryToDelete.items?.length || 0} items asociados</li>
                <li>No se puede deshacer esta acción</li>
              </ul>
            </div>
            <div className="delete-confirm-actions">
              <button
                onClick={cancelDeleteCategory}
                className="btn-cancel-delete"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="btn-confirm-delete"
              >
                Eliminar Categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleCategoryManager;