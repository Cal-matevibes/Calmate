import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Popup from '../components/ui/Popup';
import PreviewItem from '../components/features/PreviewItem';
// import ItemForm from '../components/ItemForm'; // Commented out - not currently used
import AdminFilters from '../components/admin/AdminFilters';
import AdminItemsView from '../components/admin/AdminItemsView';
import EditItemModal from '../components/admin/EditItemModal';
import AddItemModal from '../components/admin/AddItemModal';
import SimpleCategoryManager from '../components/admin/SimpleCategoryManager';
import { CarritoContext } from '../context/CarritoContext.js';
import { useAuth } from '../context/AuthContext';
import productoService from '../services/productoService';
import categoriaService from '../services/categoriaService';

import './styles/Stock.css';
import Loading from '../components/shared/Loading';

function Stock() {
  const [catalogos, setCatalogos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { carrito } = useContext(CarritoContext);
  const { token, isAdmin } = useAuth();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterByStock, setFilterByStock] = useState('all'); // all, low, out
  const [filterByPrice, setFilterByPrice] = useState('all'); // all, low, medium, high
  const [filterByCategory, setFilterByCategory] = useState('all'); // filtro por categoría
  const [attributeFilters, setAttributeFilters] = useState({}); // filtros por atributos específicos
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table
  const [adminMode, setAdminMode] = useState(false); // toggle entre vista tradicional y admin
  const [editingItem, setEditingItem] = useState(null); // item que se está editando
  const [showEditModal, setShowEditModal] = useState(false); // mostrar modal de edición
  const [offers, setOffers] = useState([]); // estado para las ofertas
  const [showHelpModal, setShowHelpModal] = useState(false); // mostrar modal de ayuda

  // Función para cargar categorías desde la base de datos
  const fetchCategorias = async () => {
    try {
      if (!token) {
        setError('No estás autenticado');
        return;
      }

      if (!isAdmin) {
        setError('No tienes permisos de administrador');
        return;
      }

      // Obtener categorías desde la API
      const categoriasResponse = await categoriaService.obtenerCategorias({
        incluirInactivas: 'false' // Solo categorías activas
      });

      if (categoriasResponse.success) {        
        // Obtener productos para cada categoría
        const productosResponse = await productoService.obtenerProductos({
          incluirInactivos: 'false',
          limit: 1000
        });

        if (productosResponse.success) {
          setProductos(productosResponse.data);

          // Organizar datos
          const categoriasConProductos = categoriasResponse.data.map(categoria => {
            const productosDeCategoria = productosResponse.data
              .filter(producto => producto.categoria === categoria.nombre)
              .map(producto => ({
                id: producto._id,
                nombre: producto.nombre,
                categoria: producto.categoria,
                precio: parseFloat(producto.precioVenta) || 0,
                precioVenta: parseFloat(producto.precioVenta) || 0,
                precioCompra: parseFloat(producto.precioCompra) || 0,
                stock: parseInt(producto.stock) || 0,
                descripcion: producto.descripcion,
                imagenes: producto.imagenes,
                activo: producto.activo,
                tags: producto.tags || [],
                campos: producto.campos || {},
                fechaCreacion: producto.createdAt,
                fechaActualizacion: producto.updatedAt
              }));

            return {
              id: categoria._id,
              nombre: categoria.nombre,
              nombreDisplay: categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1),
              descripcion: categoria.descripcion,
              imagen: categoria.imagen, // ¡CAMPO FALTANTE!
              items: productosDeCategoria,
              estadisticas: categoria.estadisticas,
              activa: categoria.activa,
              configuracion: categoria.configuracion
            };
          });
          
          setCatalogos(categoriasConProductos);
          setError(null);
        } else {
          setError(productosResponse.message || 'Error al cargar los productos');
        }
      } else {
        setError(categoriasResponse.message || 'Error al cargar las categorías');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías y productos desde la API
  useEffect(() => {
    setLoading(true);
    fetchCategorias();
  }, [token, isAdmin]);

  // Agregar nueva categoría
  const handleAddCategoria = async (categoryData) => {
    try {
      if (!token || !isAdmin) {
        setError('No tienes permisos para crear categorías');
        return;
      }

      // Determinar si es el formato nuevo (objeto) o anterior (string)
      let nombre, imagen;
      if (typeof categoryData === 'string') {
        nombre = categoryData;
        imagen = null;
      } else {
        nombre = categoryData.nombre;
        imagen = categoryData.imagen;
      }

      // Validaciones básicas del nombre
      const nombreTrimmed = nombre;
      
      if (!nombreTrimmed) {
        setError('El nombre de la categoría es obligatorio');
        return;
      }

      if (nombreTrimmed.length < 2 || nombreTrimmed.length > 50) {
        setError('El nombre debe tener entre 2 y 50 caracteres');
        return;
      }

      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrimmed)) {
        setError('El nombre solo puede contener letras y espacios');
        return;
      }

      // Verificar si la categoría ya existe (comparar sin importar mayúsculas/minúsculas)
      const categoriaExistente = catalogos.find(cat =>
        cat.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
      );

      if (categoriaExistente) {
        setError(`Ya existe una categoría con el nombre "${nombreTrimmed}"`);
        return;
      }

      const categoriaData = {
        nombre: nombreTrimmed,
        descripcion: `Categoría de ${nombreTrimmed}`,
        imagen: imagen
      };
      const response = await categoriaService.crearCategoria(categoriaData, token);

      if (response.success) {
        setSuccessMessage(`Categoría "${nombre}" creada exitosamente`);
        await fetchCategorias(); // Refrescar la lista

        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setError(response.message || 'Error al crear la categoría');
      }
    } catch (err) {
      setError(err.message || 'Error al crear la categoría');
    }
  };

  const handleEditCategoria = async (categoriaId, updateData) => {
    try {
      if (!token || !isAdmin) {
        setError('No tienes permisos para editar categorías');
        return;
      }
      
      // Determinar si es el formato nuevo (objeto) o anterior (string + descripcion)
      let nombre, descripcion, imagen;
      if (typeof updateData === 'string') {
        // Formato anterior: (categoriaId, newName, newDescription)
        nombre = updateData;
        descripcion = arguments[2] || null; // tercer parámetro
        imagen = null;
      } else {
        // Formato nuevo: (categoriaId, { nombre, descripcion, imagen })
        nombre = updateData.nombre;
        descripcion = updateData.descripcion;
        imagen = updateData.imagen;
      }
      
      // Validaciones básicas del nombre
      if (nombre && (nombre.trim().length < 2 || nombre.trim().length > 50)) {
        setError('El nombre debe tener entre 2 y 50 caracteres');
        return;
      }

      if (nombre && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim())) {
        setError('El nombre solo puede contener letras y espacios');
        return;
      }

      const categoriaData = {};
      
      // Incluir campos que pueden ser actualizados
      if (descripcion !== null && descripcion !== undefined) {
        categoriaData.descripcion = descripcion;
      }
      
      // Actualizar el nombre si se proporciona
      if (nombre && nombre.trim()) {
        categoriaData.nombre = nombre.trim();
      }

      // Actualizar la imagen si se proporciona (incluir null para eliminar imagen)
      if (imagen !== undefined) {
        categoriaData.imagen = imagen;
      }

      const response = await categoriaService.actualizarCategoria(categoriaId, categoriaData, token);

      if (response.success) {
        setSuccessMessage(`Categoría actualizada exitosamente`);
        
        // Limpiar errores previos
        setError('');
        
        // Esperar un momento antes de refrescar para asegurar que la DB se actualice
        setTimeout(async () => {
          await fetchCategorias();
        }, 500);

        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setError(response.message || 'Error al actualizar la categoría');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar la categoría');
    }
  };

  // Eliminar categoría
  const handleDeleteCategoria = async (categoriaId) => {
    try {
      if (!token || !isAdmin) {
        setError('No tienes permisos para eliminar categorías');
        return;
      }

      const response = await categoriaService.eliminarCategoria(categoriaId, token);

      if (response.success) {
        setSuccessMessage('Categoría eliminada exitosamente');
        
        // Limpiar errores previos
        setError('');
        
        // Esperar un momento antes de refrescar para asegurar que la DB se actualice
        setTimeout(async () => {
          await fetchCategorias();
        }, 500);

        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setError(response.message || 'Error al eliminar la categoría');
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar la categoría');
    }
  };

  // Agregar un nuevo item
  const handleAddItem = async (newItem) => {
    try {
      if (!token || !isAdmin) {
        setError('No tienes permisos para crear productos');
        return;
      }

      let catalogoId = newItem.catalogo || newItem.categoria;

      // Validar categoría
      if (!catalogoId) {
        setError('Debe seleccionar una categoría');
        return;
      }

      // Validar que la categoría existe en las categorías dinámicas
      const categoriaEncontrada = catalogos?.find(cat => cat.id === catalogoId || cat.nombre === catalogoId);
      
      if (!categoriaEncontrada) {
        setError(`Categoría "${catalogoId}" no válida`);
        return;
      }

      // Usar el nombre de la categoría para la API (como espera el backend)
      catalogoId = categoriaEncontrada.nombre;

      // Preparar imágenes - filtrar blob URLs
      let imagenesProcessed = [];
      if (newItem.imagenes && Array.isArray(newItem.imagenes)) {
        imagenesProcessed = newItem.imagenes
          .filter(img => img && !img.startsWith('blob:')) // Filtrar blob URLs
          .map(img => {
            if (typeof img === 'string') {
              return {
                url: img,
                alt: newItem.nombre || 'Imagen del producto'
              };
            }
            return img;
          });
      }

      // Preparar datos para la API
      const productoData = {
        nombre: newItem.nombre || '',
        categoria: catalogoId,
        descripcion: newItem.descripcion || '',
        precioCompra: Number(newItem.precioCompra) || 0,
        precioVenta: Number(newItem.precioVenta) || Number(newItem.precio) || 0,
        stock: Number(newItem.stock) || 0,
        campos: newItem.campos || {},
        imagenes: imagenesProcessed,
        tags: newItem.tags || [],
        activo: true
      };

      // Agregar características específicas según la categoría
      const cat = catalogoId?.toLowerCase();

      if (cat === 'mates') {
        const mates = {};
        if (newItem.forma) mates.forma = newItem.forma;
        if (newItem.tipo) mates.tipo = newItem.tipo;
        if (newItem.anchoSuperior) mates.anchoSuperior = newItem.anchoSuperior;
        if (newItem.anchoInferior) mates.anchoInferior = newItem.anchoInferior;
        mates.virola = newItem.virola || 'No';
        if (newItem.tiposDeVirola) mates.tiposDeVirola = newItem.tiposDeVirola;
        mates.guarda = newItem.guarda || 'No';
        if (newItem.tiposDeGuarda) mates.tiposDeGuarda = newItem.tiposDeGuarda;
        mates.revestimiento = newItem.revestimiento || 'No';
        if (newItem.tiposDeRevestimientos) mates.tiposDeRevestimientos = newItem.tiposDeRevestimientos;
        mates.curados = newItem.curados || 'No';
        if (newItem.tiposDeCurados) mates.tiposDeCurados = newItem.tiposDeCurados;
        if (newItem.terminacion) mates.terminacion = newItem.terminacion;
        mates.grabado = newItem.grabado || 'No';
        if (newItem.descripcionDelGrabado) mates.descripcionDelGrabado = newItem.descripcionDelGrabado;
        if (newItem.color) mates.color = newItem.color;
        productoData.caracteristicasMates = mates;

      } else if (cat === 'bombillas') {
        const bombillas = {};
        if (newItem.forma) bombillas.forma = newItem.forma;
        if (newItem.tipoMaterial) bombillas.tipoMaterial = newItem.tipoMaterial;
        if (newItem.tamaño) bombillas.tamaño = newItem.tamaño;
        if (newItem.centimetros) bombillas.centimetros = Number(newItem.centimetros);
        productoData.caracteristicasBombillas = bombillas;

      } else if (cat === 'combos') {
        const combos = {};
        if (newItem['combo_mates']) combos.mate = newItem['combo_mates'];
        if (newItem['combo_bombillas']) combos.bombilla = newItem['combo_bombillas'];
        if (Object.keys(combos).length > 0) productoData.caracteristicasCombos = combos;
      }
      
      // Crear producto en la API
      const response = await productoService.crearProducto(productoData, token);

      if (response.success) {
        // Mostrar mensaje de éxito
        setSuccessMessage(`Producto "${response.data.nombre}" creado exitosamente`);
        setError(null);

        // Refrescar las categorías y productos
        await fetchCategorias();

        // Limpiar el mensaje después de 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);

        return { success: true }; // Indicar éxito para cerrar el modal
      } else {
        setError(response.message || 'Error al crear el producto');
        throw new Error(response.message || 'Error al crear el producto');
      }
    } catch (err) {
      setError(err.message || 'Error al crear el producto');
    }
  };

  // Eliminar un item
  const handleDeleteItem = async (itemId, catalogoId) => {
    try {
      if (!token || !isAdmin) {
        setError('No tienes permisos para eliminar productos');
        return;
      }
      // Eliminar producto en la API
      const response = await productoService.eliminarProducto(itemId, token);

      if (response.success) {
        // Actualizar el estado local - remover el item de todas las categorías
        setCatalogos((prevCatalogos) =>
          prevCatalogos.map((catalogo) => ({
            ...catalogo,
            items: (catalogo.items || []).filter((item) => item.id !== itemId)
          }))
        );

        // También actualizar el estado de productos
        setProductos((prevProductos) =>
          prevProductos.filter((producto) => producto._id !== itemId)
        );

        setError(null);
      } else {
        setError(response.message || 'Error al eliminar el producto');
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto');
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      handleDeleteItem(itemToDelete.id, itemToDelete.catalogoId);
      setShowPopup(false);
      setItemToDelete(null);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setShowPopup(false);
    setItemToDelete(null);
  };

  // Vista previa de un item
  const handlePreviewItem = (item) => {
    setPreviewItem(item);
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
  };

  // Enviar formulario desde el modal
  const handleModalSubmit = async (formData) => {
    if (!formData.catalogo) {
      alert('Por favor selecciona una categoría');
      return;
    }

    try {
      const result = await handleAddItem(formData);
      // Cerrar el modal solo si la creación fue exitosa
      if (result && result.success) {
        setShowAddItemModal(false);
      }
    } catch (err) {
      // El error ya se maneja en handleAddItem, no cerrar el modal
    }
  };

  // Obtener atributos disponibles para la categoría seleccionada
  const getAvailableAttributes = () => {
    if (filterByCategory === 'all' || !catalogos) return {};

    const selectedCatalog = catalogos.find(cat => cat.id === filterByCategory);
    if (!selectedCatalog || !selectedCatalog.items) return {};

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

  // Manejar cambio de filtro de categoría
  const handleCategoryFilterChange = (categoryId) => {
    setFilterByCategory(categoryId);
    // Limpiar filtros de atributos cuando cambia la categoría
    setAttributeFilters({});
  };

  // Manejar cambio de filtros de atributos
  const handleAttributeFilterChange = (attributeName, value) => {
    if (attributeName === 'reset') {
      setAttributeFilters({});
      return;
    }

    setAttributeFilters(prev => ({
      ...prev,
      [attributeName]: value === 'all' ? undefined : value
    }));
  };

  // Funciones de filtrado y búsqueda
  const getFilteredItems = () => {
    if (!catalogos || catalogos.length === 0) {
      return [];
    }

    let allItems = [];

    // Siempre mostrar todos los items (tanto en vista admin como tradicional)
    allItems = catalogos.flatMap(catalogo =>
      (catalogo.items || []).map(item => ({ ...item, categoria: catalogo.nombre, catalogoId: catalogo.id }))
    );

    // Aplicar filtro de categoría
    if (filterByCategory !== 'all') {
      allItems = allItems.filter(item => item.catalogoId === filterByCategory);
    }

    // Aplicar filtros de atributos
    if (Object.keys(attributeFilters).length > 0) {
      allItems = allItems.filter(item => {
        return Object.entries(attributeFilters).every(([attrName, attrValue]) => {
          if (!attrValue) return true;

          const itemValue = item[attrName];
          if (typeof itemValue === 'boolean') {
            const itemValueStr = itemValue ? 'Sí' : 'No';
            return itemValueStr === attrValue;
          }
          return String(itemValue) === attrValue;
        });
      });
    }

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      allItems = allItems.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de stock
    if (filterByStock !== 'all') {
      allItems = allItems.filter(item => {
        if (filterByStock === 'low') return item.stock > 0 && item.stock <= 5;
        if (filterByStock === 'out') return item.stock === 0;
        return true;
      });
    }

    // Aplicar filtro de precio
    if (filterByPrice !== 'all' && filterByPrice !== '') {
      const maxPrice = parseFloat(filterByPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        allItems = allItems.filter(item => {
          const price = parseFloat(item.precioVenta) || 0;
          return price <= maxPrice;
        });
      }
    }

    // Aplicar ordenamiento
    allItems.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'precioVenta') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortBy === 'stock') {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return allItems;
  };

  // Obtener estadísticas
  const getStockStats = () => {
    if (!catalogos || catalogos.length === 0) {
      return {
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        categories: 0
      };
    }

    const allItems = catalogos.flatMap(catalogo => catalogo.items || []);
    return {
      total: allItems.length,
      lowStock: allItems.filter(item => item.stock > 0 && item.stock <= 5).length,
      outOfStock: allItems.filter(item => item.stock === 0).length,
      categories: catalogos.length
    };
  };

  // Funciones para CRUD en admin mode
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveItem = async (updatedItem) => {
    try {
      if (!token || !isAdmin) {
        setError('No tienes permisos para actualizar productos');
        return;
      }

      // Preparar datos para la API
      const productoData = {
        nombre: updatedItem.nombre,
        categoria: updatedItem.categoria,
        descripcion: updatedItem.descripcion || '',
        precioCompra: Number(updatedItem.precioCompra) || 0,
        precioVenta: Number(updatedItem.precioVenta) || Number(updatedItem.precio) || 0,
        stock: Number(updatedItem.stock) || 0,
        campos: updatedItem.campos || {},
        imagenes: updatedItem.imagenes || [],
        tags: updatedItem.tags || [],
        activo: updatedItem.activo !== false // Por defecto true
      };

      // Actualizar producto en la API
      const response = await productoService.actualizarProducto(updatedItem.id, productoData, token);

      if (response.success) {
        // Actualizar el estado local
        setCatalogos(prevCatalogos =>
          prevCatalogos.map(catalogo => ({
            ...catalogo,
            items: catalogo.items.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            )
          }))
        );

        setShowEditModal(false);
        setEditingItem(null);
        setError(null);

      } else {
        setError(response.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      setError(error.message || 'Error al actualizar el producto');
      throw error;
    }
  };

  const handleDeleteItemAdmin = (item) => {
    setItemToDelete({
      id: item.id,
      catalogoId: item.catalogoId,
      nombre: item.nombre
    });
    setShowPopup(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Mostrar loading
  if (loading) {
    return (
      <div>
        <Header carrito={carrito} userRole="admin" />
        <div className="stock-page">
          <div className="stock-container">
              <Loading text="Cargando productos..." />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div>
        <Header carrito={carrito} userRole="admin" />
        <div className="stock-page">
          <div className="stock-container">
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Error al cargar productos</h2>
              <p>{error}</p>
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header carrito={carrito} userRole="admin" />
      <div className="stock-page">
        <div className="stock-container">
          <div className="stock-header">
            <h1 className="stock-page-title">
              {adminMode ? 'Gestión de Stock' : 'Gestión de Categorías'}
            </h1>

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="success-message">
                <span className="success-text">{successMessage}</span>
                <button
                  className="success-close"
                  onClick={() => setSuccessMessage('')}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="header-controls">
              {/* Toggle para cambiar entre vistas */}
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${!adminMode ? 'active' : ''}`}
                  onClick={() => setAdminMode(false)}
                >
                  <span className="desktop-only">Categorías</span>
                  <span className="mobile-only">Categorías</span>
                </button>
                <button
                  className={`toggle-btn ${adminMode ? 'active' : ''}`}
                  onClick={() => setAdminMode(true)}
                >
                  <span className="desktop-only">Stock</span>
                  <span className="mobile-only">Stock</span>
                </button>
              </div>

              {/* Botón de ayuda */}
              <button
                className="help-btn"
                onClick={() => setShowHelpModal(true)}
                title="Ayuda sobre las vistas"
              >
                ?
              </button>
            </div>
          </div>

          <div className="stock-content">
            {!adminMode ? (
              <>
                {/* VISTA TRADICIONAL SIMPLIFICADA */}
                <SimpleCategoryManager
                  catalogos={catalogos}
                  onAddCatalogo={handleAddCategoria}
                  onEditCatalogo={handleEditCategoria}
                  onDeleteCatalogo={handleDeleteCategoria}
                  offers={offers}
                  setOffers={setOffers}
                />
              </>
            ) : (
              <>
                {/* VISTA ADMIN */}
                <AdminFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                  filterByStock={filterByStock}
                  onStockFilterChange={setFilterByStock}
                  filterByPrice={filterByPrice}
                  onPriceFilterChange={setFilterByPrice}
                  filterByCategory={filterByCategory}
                  onCategoryFilterChange={handleCategoryFilterChange}
                  attributeFilters={attributeFilters}
                  onAttributeFilterChange={handleAttributeFilterChange}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  stats={getStockStats()}
                  availableCategories={catalogos || []}
                  availableAttributes={getAvailableAttributes()}
                  onShowAddItemForm={() => setShowAddItemModal(true)}
                />

                <AdminItemsView
                  items={getFilteredItems()}
                  viewMode={viewMode}
                  onPreviewItem={handlePreviewItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItemAdmin}
                />
              </>
            )}
          </div>

          {/* Modal para agregar un nuevo item - solo en vista stock */}
          <AddItemModal
            isOpen={adminMode && showAddItemModal}
            onClose={() => setShowAddItemModal(false)}
            onSubmit={handleModalSubmit}
            catalogos={catalogos}
          />

          {/* Popup de vista previa */}
          {previewItem && (
            <PreviewItem item={previewItem} onClose={handleClosePreview} />
          )}

          {/* Popup de confirmación */}
          {showPopup && (
            <Popup
              title="Confirmar eliminación"
              description={`¿Estás seguro de que deseas eliminar "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}

          {/* Modal de edición */}
          <EditItemModal
            item={editingItem}
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            onSave={handleSaveItem}
            categories={catalogos}
          />

          {/* Modal de ayuda */}
          {showHelpModal && (
            <div className="help-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowHelpModal(false)}>
              <div className="help-modal">
                <div className="help-modal-header">
                  <h2>Guía de Vistas</h2>
                  <button
                    className="help-modal-close"
                    onClick={() => setShowHelpModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="help-modal-content">
                  <div className="help-section">
                    <div className="help-section-icon">�</div>
                    <div className="help-section-content">
                      <h3>Vista Categorías:</h3>
                      <p>Organiza y gestiona las categorías de tus productos. Puedes crear, editar y eliminar categorías.</p>
                    </div>
                  </div>

                  <div className="help-section">
                    <div className="help-section-icon">📦</div>
                    <div className="help-section-content">
                      <h3>Vista Stock:</h3>
                      <p>Gestión completa de inventario con filtros avanzados, agregar/editar/eliminar items, y análisis detallado.</p>
                    </div>
                  </div>

                  <div className="help-section">
                    <div className="help-section-icon">🎁</div>
                    <div className="help-section-content">
                      <h3>Ofertas:</h3>
                      <p>Haz clic en la categoría Ofertas para gestionar promociones y descuentos.</p>
                    </div>
                  </div>
                </div>

                <div className="help-modal-footer">
                  <button
                    className="help-modal-ok"
                    onClick={() => setShowHelpModal(false)}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Stock;