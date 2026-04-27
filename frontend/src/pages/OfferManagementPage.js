import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productoService from '../services/productoService';
import categoriaService from '../services/categoriaService';
import '../components/styles/OfferManagementPage.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function OfferManagementPage({ catalogos = [] }) {
    const navigate = useNavigate();
    const { token, isAdmin } = useAuth();
    const [step, setStep] = useState(1); // 1: seleccionar tipo, 2: seleccionar items, 3: configurar descuento
    const [selectionType, setSelectionType] = useState('producto'); // 'producto', 'productos', 'categoria'
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [discountType, setDiscountType] = useState('porcentaje'); // 'porcentaje', 'precioFijo'
    const [discountValue, setDiscountValue] = useState('');
    const [offerDuration, setOfferDuration] = useState('indefinido'); // 'indefinido', 'dias', 'fecha'
    const [offerDays, setOfferDays] = useState('');
    const [offerEndDate, setOfferEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Obtener categorías y productos desde el backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                if (!token || !isAdmin) {
                    setError('No tienes permiso para acceder a esta página');
                    return;
                }

                // Obtener categorías
                const categoriasResponse = await categoriaService.obtenerCategorias({
                    incluirInactivas: 'false'
                });

                if (!categoriasResponse.success) {
                    throw new Error(categoriasResponse.message || 'Error al cargar las categorías');
                }

                // Obtener productos
                const productosResponse = await productoService.obtenerProductos({
                    incluirInactivos: 'false',
                    limit: 1000
                });

                if (!productosResponse.success) {
                    throw new Error(productosResponse.message || 'Error al cargar los productos');
                }

                // Procesar categorías
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
                            campos: producto.campos || {}
                        }));

                    return {
                        id: categoria._id,
                        nombre: categoria.nombre,
                        nombreDisplay: categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1),
                        descripcion: categoria.descripcion,
                        imagen: categoria.imagen,
                        items: productosDeCategoria,
                        activa: categoria.activa
                    };
                });

                setCategories(categoriasConProductos);

                // Obtener todos los productos en un array plano
                const allProds = productosResponse.data.map(producto => {
                    const categoria = categoriasResponse.data.find(cat => cat.nombre === producto.categoria);
                    return {
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
                        campos: producto.campos || {}
                    };
                });

                setAllProducts(allProds);
                setError('');
            } catch (err) {
                setError(err.message || 'Error al cargar los datos');
                setAllProducts([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, isAdmin]);

    const handleBackStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigate('/stock');
        }
    };

    const handleNextStep = () => {
        if (step === 1) {
            // Validar que se haya seleccionado un tipo
            if (!selectionType) {
                setError('Por favor selecciona un tipo de oferta');
                return;
            }
            setStep(2);
            setError('');
        } else if (step === 2) {
            // Validar que se hayan seleccionado items
            if (selectionType === 'categoria' && !selectedCategory) {
                setError('Por favor selecciona una categoría');
                return;
            }
            if ((selectionType === 'producto' || selectionType === 'productos') && selectedItems.length === 0) {
                setError('Por favor selecciona al menos un producto');
                return;
            }
            setStep(3);
            setError('');
        }
    };

    const handleProductSelect = (productId) => {
        if (selectionType === 'producto') {
            // Si es un solo producto, reemplazar la selección
            setSelectedItems([productId]);
        } else {
            // Si son varios, toggle
            setSelectedItems(prev =>
                prev.includes(productId)
                    ? prev.filter(id => id !== productId)
                    : [...prev, productId]
            );
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Validar descuento
            if (!discountValue || parseFloat(discountValue) <= 0) {
                setError('Por favor ingresa un valor de descuento válido');
                return;
            }

            if (discountType === 'porcentaje' && parseFloat(discountValue) > 100) {
                setError('El porcentaje no puede ser mayor a 100%');
                return;
            }

            // Calcular fecha de vencimiento
            let tiempoOferta = null;
            if (offerDuration === 'dias') {
                if (!offerDays || parseFloat(offerDays) <= 0) {
                    setError('Por favor ingresa una cantidad de días válida');
                    return;
                }
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + parseFloat(offerDays));
                tiempoOferta = endDate.toISOString();
            } else if (offerDuration === 'fecha') {
                if (!offerEndDate) {
                    setError('Por favor selecciona una fecha de vencimiento');
                    return;
                }
                tiempoOferta = new Date(offerEndDate).toISOString();
            }

            // Preparar datos
            const payload = {
                precioDescuento: parseFloat(discountValue),
                tipoDescuento: discountType,
                tiempoOferta: tiempoOferta
            };

            // Agregar productos o categoría
            if (selectionType === 'categoria') {
                payload.categoria = selectedCategory;
            } else {
                payload.productos = selectedItems;
            }

            // Hacer request al servidor
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/ofertas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Error al crear la oferta');
                return;
            }

            setSuccess(`✅ ${data.message}`);

            // Resetear formulario después de 2 segundos
            setTimeout(() => {
                resetForm();
                navigate('/stock');
            }, 2000);

        } catch (err) {
            setError('Error al crear la oferta: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setSelectionType('producto');
        setSelectedItems([]);
        setSelectedCategory(null);
        setDiscountType('porcentaje');
        setDiscountValue('');
        setOfferDuration('indefinido');
        setOfferDays('');
        setOfferEndDate('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="offer-management-page">
            <Header />
            <div className="offer-container">
                {/* Header */}
                <div className="offer-header-section">
                    <button className="btn-back" onClick={handleBackStep}>
                        ← Atrás
                    </button>
                    <h1>🏷️ Gestor de Ofertas</h1>
                    <div className="step-indicator">
                        <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>1</div>
                        <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
                        <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>2</div>
                        <div className={`step-line ${step > 2 ? 'completed' : ''}`}></div>
                        <div className={`step ${step === 3 ? 'active' : ''}`}>3</div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">❌</span>
                        <span>{error}</span>
                        <button className="alert-close" onClick={() => setError('')}>✕</button>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✅</span>
                        <span>{success}</span>
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando datos...</p>
                    </div>
                )}

                {/* Main content - hidden while loading */}
                {!loading && (
                    <>

                        {/* Step 1: Seleccionar tipo */}
                        {step === 1 && (
                            <div className="step-content">
                                <h2>Paso 1: ¿Qué deseas ofertar?</h2>
                                <p className="step-description">Elige si deseas aplicar el descuento a un producto, múltiples productos o una categoría completa.</p>

                                <div className="selection-options">
                                    <label className={`option-card ${selectionType === 'producto' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="selectionType"
                                            value="producto"
                                            checked={selectionType === 'producto'}
                                            onChange={(e) => setSelectionType(e.target.value)}
                                        />
                                        <div className="option-content">
                                            <div className="option-icon">📦</div>
                                            <div className="option-text">
                                                <h3>Un Producto</h3>
                                                <p>Aplica descuento a un único producto</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`option-card ${selectionType === 'productos' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="selectionType"
                                            value="productos"
                                            checked={selectionType === 'productos'}
                                            onChange={(e) => setSelectionType(e.target.value)}
                                        />
                                        <div className="option-content">
                                            <div className="option-icon">📦📦</div>
                                            <div className="option-text">
                                                <h3>Varios Productos</h3>
                                                <p>Aplica descuento a múltiples productos seleccionados</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`option-card ${selectionType === 'categoria' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="selectionType"
                                            value="categoria"
                                            checked={selectionType === 'categoria'}
                                            onChange={(e) => setSelectionType(e.target.value)}
                                        />
                                        <div className="option-content">
                                            <div className="option-icon">🏷️</div>
                                            <div className="option-text">
                                                <h3>Categoría Completa</h3>
                                                <p>Aplica descuento a todos los productos de una categoría</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="step-actions">
                                    <button className="btn-cancel" onClick={() => navigate('/stock')}>Cancelar</button>
                                    <button className="btn-next" onClick={handleNextStep}>Siguiente →</button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Seleccionar items */}
                        {step === 2 && (
                            <div className="step-content">
                                {selectionType === 'categoria' ? (
                                    <>
                                        <h2>Paso 2: Selecciona una Categoría</h2>
                                        <p className="step-description">Elige la categoría a la cual aplicarás el descuento.</p>

                                        <div className="categories-grid">
                                            {Array.isArray(categories) && categories.map(cat => (
                                                <label
                                                    key={cat.id}
                                                    className={`category-card ${selectedCategory === cat.nombre ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        value={cat.nombre}
                                                        checked={selectedCategory === cat.nombre}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                    />
                                                    <div className="category-card-content">
                                                        {cat.imagen?.url && (
                                                            <img src={cat.imagen.url} alt={cat.nombre} className="category-image" />
                                                        )}
                                                        <h3>{cat.nombre}</h3>
                                                        <p className="product-count">📦 {cat.items?.length || 0} productos</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {(!Array.isArray(categories) || categories.length === 0) && (
                                            <div className="empty-message">No hay categorías disponibles</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h2>Paso 2: Selecciona {selectionType === 'producto' ? 'un Producto' : 'Productos'}</h2>
                                        <p className="step-description">
                                            {selectionType === 'producto'
                                                ? 'Elige el producto para aplicar el descuento.'
                                                : 'Selecciona múltiples productos para aplicar el descuento. Puedes seleccionar todos los que desees.'}
                                        </p>

                                        <div className="products-selection-grid">
                                            {Array.isArray(allProducts) && allProducts.map(product => (
                                                <label
                                                    key={product.id}
                                                    className={`product-card ${selectedItems.includes(product.id) ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type={selectionType === 'producto' ? 'radio' : 'checkbox'}
                                                        name={selectionType === 'producto' ? 'product' : 'products'}
                                                        value={product.id}
                                                        checked={selectedItems.includes(product.id)}
                                                        onChange={() => handleProductSelect(product.id)}
                                                    />
                                                    <div className="product-card-content">
                                                        {product.imagenes && product.imagenes.length > 0 && (
                                                            <img
                                                                src={product.imagenes[0].url || '/placeholder.svg'}
                                                                alt={product.nombre}
                                                                className="product-image"
                                                                onError={(e) => (e.target.src = '/placeholder.svg')}
                                                            />
                                                        )}
                                                        <div className="product-info">
                                                            <h4>{product.nombre}</h4>
                                                            <p className="product-category">{product.categoria}</p>
                                                            <p className="product-price">${product.precioVenta}</p>
                                                            <p className="product-stock">Stock: {product.stock || 0}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {(!Array.isArray(allProducts) || allProducts.length === 0) && (
                                            <div className="empty-message">No hay productos disponibles</div>
                                        )}

                                        {selectedItems.length > 0 && selectionType === 'productos' && (
                                            <div className="selected-count">
                                                ✓ {selectedItems.length} producto(s) seleccionado(s)
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="step-actions">
                                    <button className="btn-back-step" onClick={() => setStep(1)}>← Atrás</button>
                                    <button className="btn-next" onClick={handleNextStep}>Siguiente →</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Configurar descuento */}
                        {step === 3 && (
                            <div className="step-content">
                                <h2>Paso 3: Configura el Descuento</h2>
                                <p className="step-description">Define el tipo y valor del descuento, así como su duración.</p>

                                <div className="form-section">
                                    <h3>Tipo de Descuento</h3>
                                    <div className="discount-type-options">
                                        <label className={`discount-option ${discountType === 'porcentaje' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="discountType"
                                                value="porcentaje"
                                                checked={discountType === 'porcentaje'}
                                                onChange={(e) => setDiscountType(e.target.value)}
                                            />
                                            <div className="option-content">
                                                <span className="icon">🔥</span>
                                                <span className="label">Porcentaje (%)</span>
                                            </div>
                                        </label>

                                        <label className={`discount-option ${discountType === 'precioFijo' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="discountType"
                                                value="precioFijo"
                                                checked={discountType === 'precioFijo'}
                                                onChange={(e) => setDiscountType(e.target.value)}
                                            />
                                            <div className="option-content">
                                                <span className="icon">💰</span>
                                                <span className="label">Precio Fijo</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="discount-value">
                                            {discountType === 'porcentaje' ? 'Porcentaje de Descuento' : 'Precio Fijo'}
                                            <span className="required">*</span>
                                        </label>
                                        <div className="input-with-suffix">
                                            <input
                                                id="discount-value"
                                                type="number"
                                                min="0"
                                                max={discountType === 'porcentaje' ? '100' : undefined}
                                                step={discountType === 'porcentaje' ? '1' : '0.01'}
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(e.target.value)}
                                                placeholder={discountType === 'porcentaje' ? 'Ej: 25' : 'Ej: 99.99'}
                                                className="input-field"
                                            />
                                            <span className="input-suffix">{discountType === 'porcentaje' ? '%' : '$'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Duración de la Oferta</h3>
                                    <div className="duration-options">
                                        <label className={`duration-option ${offerDuration === 'indefinido' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="offerDuration"
                                                value="indefinido"
                                                checked={offerDuration === 'indefinido'}
                                                onChange={(e) => setOfferDuration(e.target.value)}
                                            />
                                            <span>Sin fecha de vencimiento</span>
                                        </label>

                                        <label className={`duration-option ${offerDuration === 'dias' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="offerDuration"
                                                value="dias"
                                                checked={offerDuration === 'dias'}
                                                onChange={(e) => setOfferDuration(e.target.value)}
                                            />
                                            <span>Por cantidad de días</span>
                                        </label>

                                        <label className={`duration-option ${offerDuration === 'fecha' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="offerDuration"
                                                value="fecha"
                                                checked={offerDuration === 'fecha'}
                                                onChange={(e) => setOfferDuration(e.target.value)}
                                            />
                                            <span>Hasta una fecha específica</span>
                                        </label>
                                    </div>

                                    {offerDuration === 'dias' && (
                                        <div className="form-group">
                                            <label htmlFor="offer-days">Cantidad de Días</label>
                                            <input
                                                id="offer-days"
                                                type="number"
                                                min="1"
                                                value={offerDays}
                                                onChange={(e) => setOfferDays(e.target.value)}
                                                placeholder="Ej: 7"
                                                className="input-field"
                                            />
                                        </div>
                                    )}

                                    {offerDuration === 'fecha' && (
                                        <div className="form-group">
                                            <label htmlFor="offer-date">Fecha de Vencimiento</label>
                                            <input
                                                id="offer-date"
                                                type="date"
                                                value={offerEndDate}
                                                onChange={(e) => setOfferEndDate(e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="summary-section">
                                    <h3>📋 Resumen de la Oferta</h3>
                                    <div className="summary-item">
                                        <span className="label">Tipo:</span>
                                        <span className="value">
                                            {selectionType === 'categoria'
                                                ? `Categoría: ${selectedCategory}`
                                                : `${selectedItems.length} producto(s) seleccionado(s)`}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Descuento:</span>
                                        <span className="value">
                                            {discountType === 'porcentaje'
                                                ? `${discountValue}% OFF`
                                                : `Precio: $${discountValue}`}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Duración:</span>
                                        <span className="value">
                                            {offerDuration === 'indefinido'
                                                ? 'Sin fecha de vencimiento'
                                                : offerDuration === 'dias'
                                                    ? `${offerDays} días`
                                                    : `Hasta ${offerEndDate}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="step-actions">
                                    <button className="btn-back-step" onClick={() => setStep(2)}>← Atrás</button>
                                    <button
                                        className="btn-submit"
                                        onClick={handleSubmit}
                                        disabled={loading || !discountValue}
                                    >
                                        {loading ? 'Guardando...' : '✅ Crear Oferta'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default OfferManagementPage;
