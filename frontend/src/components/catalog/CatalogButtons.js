import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirigir
import './styles/CatalogButtons.css';
import Popup from './Popup'; // Importa el componente Popup

function CatalogButtons({
  catalogos,
  selectedCatalogo,
  onSelectCatalogo,
  onAddCatalogo,
  onEditCatalogo,
  onDeleteCatalogo,
}) {
  const [newCatalogName, setNewCatalogName] = useState('');
  const [showNewCatalogInput, setShowNewCatalogInput] = useState(false);
  const [editingCatalogId, setEditingCatalogId] = useState(null);
  const [editingCatalogName, setEditingCatalogName] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false); // Estado para mostrar el popup
  const [catalogoToDelete, setCatalogoToDelete] = useState(null); // Almacena el catálogo a eliminar

  const navigate = useNavigate(); // Hook para redirigir a otras páginas

  const handleAddCatalogo = () => {
    if (newCatalogName.trim() === '') return;
    onAddCatalogo(newCatalogName.trim());
    setNewCatalogName('');
    setShowNewCatalogInput(false);
  };

  const handleEditCatalogo = () => {
    if (editingCatalogName.trim() === '') return;
    onEditCatalogo(editingCatalogId, editingCatalogName.trim());
    setEditingCatalogId(null);
    setEditingCatalogName('');
  };

  const handleDeleteCatalogo = () => {
    if (catalogoToDelete) {
      onDeleteCatalogo(catalogoToDelete); // Llama a la función para eliminar el catálogo

      // Encuentra el siguiente catálogo a seleccionar
      const remainingCatalogos = catalogos.filter((cat) => cat.id !== catalogoToDelete);
      if (remainingCatalogos.length > 0) {
        onSelectCatalogo(remainingCatalogos[0].id); // Selecciona el primer catálogo restante
      } else {
        onSelectCatalogo('all'); // Si no hay más catálogos, selecciona "Todos"
      }

      setShowDeletePopup(false); // Cierra el popup
      setCatalogoToDelete(null); // Limpia el estado
    }
  };

  const handleAddNewItem = () => {
    navigate('/create-item'); // Redirige a la página de creación de ítems
  };

  return (
    <div className="catalog-buttons-container">
      {/* Botones de acciones */}
      <div className="catalog-actions">
        <button
          className="catalog-button new-item-button"
          onClick={handleAddNewItem} // Llama a la función para redirigir
        >
          Nuevo ítem
        </button>

        {showNewCatalogInput ? (
          <div className="add-catalog-form">
            <input
              type="text"
              placeholder="Nueva categoría"
              value={newCatalogName}
              onChange={(e) => setNewCatalogName(e.target.value)}
            />
            <button onClick={handleAddCatalogo}>Agregar</button>
            <button onClick={() => setShowNewCatalogInput(false)}>Cancelar</button>
          </div>
        ) : (
          <button
            className="catalog-button new-catalog-button"
            onClick={() => setShowNewCatalogInput(true)}
          >
            Nueva categoría
          </button>
        )}
      </div>

      {/* Lista de categorías */}
      <div className="catalog-items">
        {/* Botón para mostrar todos los items */}
        <button
          className={`catalog-button ${selectedCatalogo === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCatalogo('all')}
        >
          <span className="catalog-name">Todos</span>
        </button>

        {/* Lista de categorías */}
        {catalogos.map((catalogo) => (
          <button
            key={catalogo.id}
            className={`catalog-button ${selectedCatalogo === catalogo.id ? 'active' : ''}`}
            onClick={() => onSelectCatalogo(catalogo.id)}
          >
            <span className="catalog-name">{catalogo.nombre}</span>
            <span className="catalog-icons">
              <i
                className="fas fa-pencil-alt edit-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCatalogId(catalogo.id);
                  setEditingCatalogName(catalogo.nombre);
                }}
              ></i>
              <i
                className="fas fa-trash delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setCatalogoToDelete(catalogo.id); // Almacena el ID del catálogo a eliminar
                  setShowDeletePopup(true); // Muestra el popup
                }}
              ></i>
            </span>
          </button>
        ))}
      </div>

      {/* Input de edición debajo de la línea de categorías */}
      {editingCatalogId && (
        <div className="edit-catalog-form">
          <input
            type="text"
            value={editingCatalogName}
            onChange={(e) => setEditingCatalogName(e.target.value)}
          />
          <button className="edit-catalog-form-buttons" onClick={handleEditCatalogo}>
            Guardar
          </button>
          <button
            className="edit-catalog-form-buttons"
            onClick={() => setEditingCatalogId(null)}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Popup de confirmación para eliminar */}
      {showDeletePopup && (
        <Popup
          title="Confirmar eliminación"
          description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
          onConfirm={handleDeleteCatalogo} // Llama a la función para eliminar
          onCancel={() => {
            setShowDeletePopup(false); // Cierra el popup
            setCatalogoToDelete(null); // Limpia el estado
          }}
        />
      )}
    </div>
  );
}

export default CatalogButtons;