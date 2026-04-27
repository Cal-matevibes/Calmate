// src/components/cart/CheckoutForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import './styles/CheckoutForm.css';

const PROVINCIAS_ARGENTINA = [
    'Buenos Aires',
    'Ciudad Autónoma de Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
];

function CheckoutForm({
    initialData,
    onSubmit,
    onBack,
    // Props para CartSummary
    items = [],
    itemCount = 0,
    subtotal = 0,
    total = 0,
    envio = 0,
    showShipping = false
}) {
    const { user, isAuthenticated } = useAuth();
    const { actualizarInfoRegalo } = useCarrito();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        pais: 'Argentina',
        codigoPostal: '',
        notas: '',
        esRegalo: false,
        // Datos de la persona que recibe el regalo
        nombreRegalo: '',
        apellidoRegalo: '',
        dedicatoria: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efecto para cargar datos del usuario si está logueado
    useEffect(() => {
        if (isAuthenticated && user) {
            // Dividir el nombre completo del usuario en nombre y apellido si existe
            const nombreCompleto = user.nombre || user.name || '';
            const partesNombre = nombreCompleto.trim().split(' ');
            const nombre = partesNombre[0] || '';
            const apellido = partesNombre.slice(1).join(' ') || '';

            setFormData(prev => ({
                ...prev,
                nombre: nombre,
                apellido: apellido,
                email: user.email || '',
                telefono: user.telefono || user.phone || ''
                // Dirección no se completa automáticamente por seguridad
            }));
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};

        // Nombre
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        // Apellido
        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es requerido';
        } else if (formData.apellido.trim().length < 2) {
            newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Teléfono
        const telefonoRegex = /^[\d\s\-+()]{8,}$/;
        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!telefonoRegex.test(formData.telefono.replace(/\s/g, ''))) {
            newErrors.telefono = 'El teléfono no es válido';
        }

        // Dirección
        if (!formData.direccion.trim()) {
            newErrors.direccion = 'La dirección es requerida';
        } else if (formData.direccion.trim().length < 5) {
            newErrors.direccion = 'La dirección debe ser más específica';
        }

        // Ciudad
        if (!formData.ciudad.trim()) {
            newErrors.ciudad = 'La ciudad es requerida';
        }

        // Provincia
        if (!formData.provincia) {
            newErrors.provincia = 'La provincia es requerida';
        }

        // Código Postal
        if (!formData.codigoPostal.trim()) {
            newErrors.codigoPostal = 'El código postal es requerido';
        } else if (formData.codigoPostal.trim().length < 4) {
            newErrors.codigoPostal = 'El código postal no es válido';
        }

        // Validación para campos de regalo si está marcado
        if (formData.esRegalo) {
            if (!formData.nombreRegalo.trim()) {
                newErrors.nombreRegalo = 'El nombre del destinatario es requerido';
            } else if (formData.nombreRegalo.trim().length < 2) {
                newErrors.nombreRegalo = 'El nombre debe tener al menos 2 caracteres';
            }

            if (!formData.apellidoRegalo.trim()) {
                newErrors.apellidoRegalo = 'El apellido del destinatario es requerido';
            } else if (formData.apellidoRegalo.trim().length < 2) {
                newErrors.apellidoRegalo = 'El apellido debe tener al menos 2 caracteres';
            }
        }

        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Si es un campo de regalo y está marcado como regalo, actualizar el contexto
        if ((name === 'nombreRegalo' || name === 'apellidoRegalo' || name === 'dedicatoria') && formData.esRegalo) {
            // Usar un pequeño delay para evitar demasiadas llamadas
            clearTimeout(window.regaloUpdateTimeout);
            window.regaloUpdateTimeout = setTimeout(async () => {
                try {
                    const nombreRegalo = name === 'nombreRegalo' ? value : formData.nombreRegalo;
                    const apellidoRegalo = name === 'apellidoRegalo' ? value : formData.apellidoRegalo;
                    const dedicatoria = name === 'dedicatoria' ? value : formData.dedicatoria;
                    await actualizarInfoRegalo(true, nombreRegalo, apellidoRegalo, dedicatoria);
                } catch (error) {
                    console.error('Error actualizando información de regalo:', error);
                }
            }, 1000); // Actualizar después de 1 segundo sin cambios
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleRegaloChange = async (e) => {
        const esRegalo = e.target.checked;

        setFormData(prev => ({
            ...prev,
            esRegalo: esRegalo,
            // Limpiar campos de regalo cuando se desmarca
            nombreRegalo: esRegalo ? prev.nombreRegalo : '',
            apellidoRegalo: esRegalo ? prev.apellidoRegalo : ''
        }));

        // Actualizar información de regalo en el contexto del carrito
        try {
            await actualizarInfoRegalo(
                esRegalo,
                esRegalo ? formData.nombreRegalo : '',
                esRegalo ? formData.apellidoRegalo : '',
                esRegalo ? formData.dedicatoria : ''
            );
        } catch (error) {
            console.error('Error actualizando información de regalo:', error);
        }

        // Limpiar errores relacionados con regalo
        if (!esRegalo) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.nombreRegalo;
                delete newErrors.apellidoRegalo;
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-form">
            {/* Vista móvil - Desplegables paso a paso */}
            <div className="mobile-checkout-steps">

                {/* Paso 1: Productos en tu carrito - Completado (cerrado con check) */}
                <div className="mobile-step-section completed">
                    <div className="mobile-step-header">
                        <div className="step-info">
                            <span className="step-number">1</span>
                            <span className="step-title">Productos en tu carrito</span>
                        </div>
                        <div className="step-status">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                    </div>
                    {/* Este desplegable siempre está cerrado */}
                </div>

                {/* Paso 2: Datos de envío - Activo (abierto con el formulario y summary) */}
                <div className="mobile-step-section active">
                    <div className="mobile-step-header">
                        <div className="step-info">
                            <span className="step-number">2</span>
                            <span className="step-title">Datos de envío</span>
                        </div>
                        <div className="step-status">
                            <i className="bi bi-chevron-down"></i>
                        </div>
                    </div>
                    <div className="mobile-step-content">
                        {/* Formulario de checkout */}
                        <form onSubmit={handleSubmit} className="checkout-form-content">
                            {/* Personal Information */}
                            <div className="checkout-form-section">
                                <h3 className="checkout-section-title">Datos Personales</h3>



                                {/* Nombre y Apellido en la misma fila */}
                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label htmlFor="nombre" className="checkout-form-label">
                                            Nombre *
                                        </label>
                                        <input
                                            id="nombre"
                                            name="nombre"
                                            type="text"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.nombre ? 'checkout-input-error' : ''}`}
                                            placeholder="Nombre"
                                            autoComplete="given-name"
                                        />
                                        {errors.nombre && <span className="checkout-form-error">{errors.nombre}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="apellido" className="checkout-form-label">
                                            Apellido *
                                        </label>
                                        <input
                                            id="apellido"
                                            name="apellido"
                                            type="text"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.apellido ? 'checkout-input-error' : ''}`}
                                            placeholder="Apellido"
                                            autoComplete="family-name"
                                        />
                                        {errors.apellido && <span className="checkout-form-error">{errors.apellido}</span>}
                                    </div>
                                </div>

                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label htmlFor="email" className="checkout-form-label">
                                            Email *
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.email ? 'checkout-input-error' : ''}`}
                                            placeholder="tu@email.com"
                                            autoComplete="email"
                                        />
                                        {errors.email && <span className="checkout-form-error">{errors.email}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="telefono" className="checkout-form-label">
                                            Teléfono *
                                        </label>
                                        <input
                                            id="telefono"
                                            name="telefono"
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.telefono ? 'checkout-input-error' : ''}`}
                                            placeholder="+54 280 123-4567"
                                            autoComplete="tel"
                                        />
                                        {errors.telefono && <span className="checkout-form-error">{errors.telefono}</span>}
                                    </div>
                                </div>

                                {/* Checkbox para regalo/otra persona */}
                                <div className={`checkout-form-group checkbox-group${formData.esRegalo ? ' checked' : ''}`}>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.esRegalo}
                                            onChange={handleRegaloChange}
                                            className="checkbox-input"
                                        />
                                        <span className="checkbox-text">
                                            Es un regalo o para otra persona
                                        </span>
                                    </label>
                                </div>

                                {/* Campos condicionales para regalo */}
                                {formData.esRegalo && (
                                    <div className="regalo-fields">
                                        <h4 className="regalo-subtitle">Datos del destinatario</h4>
                                        <div className="checkout-form-row">
                                            <div className="checkout-form-group">
                                                <label htmlFor="nombreRegalo" className="checkout-form-label">
                                                    Nombre del destinatario *
                                                </label>
                                                <input
                                                    id="nombreRegalo"
                                                    name="nombreRegalo"
                                                    type="text"
                                                    value={formData.nombreRegalo}
                                                    onChange={handleInputChange}
                                                    className={`checkout-form-input ${errors.nombreRegalo ? 'checkout-input-error' : ''}`}
                                                    placeholder="Nombre"
                                                    autoComplete="given-name"
                                                />
                                                {errors.nombreRegalo && <span className="checkout-form-error">{errors.nombreRegalo}</span>}
                                            </div>

                                            <div className="checkout-form-group">
                                                <label htmlFor="apellidoRegalo" className="checkout-form-label">
                                                    Apellido del destinatario *
                                                </label>
                                                <input
                                                    id="apellidoRegalo"
                                                    name="apellidoRegalo"
                                                    type="text"
                                                    value={formData.apellidoRegalo}
                                                    onChange={handleInputChange}
                                                    className={`checkout-form-input ${errors.apellidoRegalo ? 'checkout-input-error' : ''}`}
                                                    placeholder="Apellido"
                                                    autoComplete="family-name"
                                                />
                                                {errors.apellidoRegalo && <span className="checkout-form-error">{errors.apellidoRegalo}</span>}
                                            </div>
                                        </div>

                                        <div className="checkout-form-group">
                                            <label htmlFor="dedicatoria" className="checkout-form-label">
                                                Dedicatoria o mensaje (Opcional)
                                            </label>
                                            <textarea
                                                id="dedicatoria"
                                                name="dedicatoria"
                                                value={formData.dedicatoria}
                                                onChange={handleInputChange}
                                                className="checkout-form-textarea"
                                                placeholder="Escribí el mensaje que queriés que reciba esa persona..."
                                                rows="3"
                                                maxLength={500}
                                            />
                                            <span className="checkout-form-hint">{formData.dedicatoria.length}/500</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div className="checkout-form-section">
                                <h3 className="checkout-section-title">Dirección de Envío</h3>

                                <div className="checkout-form-group">
                                    <label htmlFor="direccion" className="checkout-form-label">
                                        Dirección *
                                    </label>
                                    <input
                                        id="direccion"
                                        name="direccion"
                                        type="text"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        className={`checkout-form-input ${errors.direccion ? 'checkout-input-error' : ''}`}
                                        placeholder="Calle, número, piso, departamento"
                                        autoComplete="street-address"
                                    />
                                    {errors.direccion && <span className="checkout-form-error">{errors.direccion}</span>}
                                </div>

                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label htmlFor="pais" className="checkout-form-label">
                                            País
                                        </label>
                                        <input
                                            id="pais"
                                            name="pais"
                                            type="text"
                                            value="Argentina"
                                            readOnly
                                            className="checkout-form-input checkout-input-readonly"
                                        />
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="provincia" className="checkout-form-label">
                                            Provincia *
                                        </label>
                                        <select
                                            id="provincia"
                                            name="provincia"
                                            value={formData.provincia}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.provincia ? 'checkout-input-error' : ''}`}
                                        >
                                            <option value="">Seleccioná una provincia</option>
                                            {PROVINCIAS_ARGENTINA.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        {errors.provincia && <span className="checkout-form-error">{errors.provincia}</span>}
                                    </div>
                                </div>

                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label htmlFor="ciudad" className="checkout-form-label">
                                            Ciudad *
                                        </label>
                                        <input
                                            id="ciudad"
                                            name="ciudad"
                                            type="text"
                                            value={formData.ciudad}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.ciudad ? 'checkout-input-error' : ''}`}
                                            placeholder="Tu ciudad"
                                            autoComplete="address-level2"
                                        />
                                        {errors.ciudad && <span className="checkout-form-error">{errors.ciudad}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="codigoPostal" className="checkout-form-label">
                                            Código Postal *
                                        </label>
                                        <input
                                            id="codigoPostal"
                                            name="codigoPostal"
                                            type="text"
                                            value={formData.codigoPostal}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.codigoPostal ? 'checkout-input-error' : ''}`}
                                            placeholder="9120"
                                            autoComplete="postal-code"
                                        />
                                        {errors.codigoPostal && <span className="checkout-form-error">{errors.codigoPostal}</span>}
                                    </div>
                                </div>


                            </div>

                            {/* Additional Notes */}
                            <div className="checkout-form-section">
                                <div className="checkout-form-group">
                                    <label htmlFor="notas" className="checkout-form-label">
                                        Notas del Pedido (Opcional)
                                    </label>
                                    <textarea
                                        id="notas"
                                        name="notas"
                                        value={formData.notas}
                                        onChange={handleInputChange}
                                        className="checkout-form-textarea"
                                        placeholder="Información adicional sobre la entrega..."
                                        rows="3"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="checkout-form-actions">
                                <button
                                    type="button"
                                    className="checkout-btn-back"
                                    onClick={onBack}
                                    disabled={isSubmitting}
                                >
                                    <i className="bi bi-arrow-left"></i>
                                    Volver al Carrito
                                </button>

                                <button
                                    type="submit"
                                    className="checkout-btn-continue"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="checkout-spinner"></span>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Continuar al Pago
                                            <i className="bi bi-arrow-right"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Vista desktop - formulario tradicional */}
            <div className="desktop-checkout">
                <form onSubmit={handleSubmit} className="checkout-form-content">
                    {/* Personal Information */}
                    <div className="checkout-form-section">
                        <h3 className="checkout-section-title">Datos Personales</h3>

                        {/* Nombre y Apellido separados */}
                        <div className="checkout-form-row">
                            <div className="checkout-form-group">
                                <label htmlFor="nombre-desktop" className="checkout-form-label">
                                    Nombre *
                                </label>
                                <input
                                    id="nombre-desktop"
                                    name="nombre"
                                    type="text"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.nombre ? 'checkout-input-error' : ''}`}
                                    placeholder="Nombre"
                                    autoComplete="given-name"
                                />
                                {errors.nombre && <span className="checkout-form-error">{errors.nombre}</span>}
                            </div>

                            <div className="checkout-form-group">
                                <label htmlFor="apellido-desktop" className="checkout-form-label">
                                    Apellido *
                                </label>
                                <input
                                    id="apellido-desktop"
                                    name="apellido"
                                    type="text"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.apellido ? 'checkout-input-error' : ''}`}
                                    placeholder="Apellido"
                                    autoComplete="family-name"
                                />
                                {errors.apellido && <span className="checkout-form-error">{errors.apellido}</span>}
                            </div>
                        </div>

                        <div className="checkout-form-row">
                            <div className="checkout-form-group">
                                <label htmlFor="email-desktop" className="checkout-form-label">
                                    Email *
                                </label>
                                <input
                                    id="email-desktop"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.email ? 'checkout-input-error' : ''}`}
                                    placeholder="tu@email.com"
                                    autoComplete="email"
                                />
                                {errors.email && <span className="checkout-form-error">{errors.email}</span>}
                            </div>

                            <div className="checkout-form-group">
                                <label htmlFor="telefono-desktop" className="checkout-form-label">
                                    Teléfono *
                                </label>
                                <input
                                    id="telefono-desktop"
                                    name="telefono"
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.telefono ? 'checkout-input-error' : ''}`}
                                    placeholder="+54 280 123-4567"
                                    autoComplete="tel"
                                />
                                {errors.telefono && <span className="checkout-form-error">{errors.telefono}</span>}
                            </div>
                        </div>

                        {/* Checkbox para regalo/otra persona */}
                        <div className={`checkout-form-group checkbox-group${formData.esRegalo ? ' checked' : ''}`}>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.esRegalo}
                                    onChange={handleRegaloChange}
                                    className="checkbox-input"
                                />
                                <span className="checkbox-text">
                                    Es un regalo o para otra persona
                                </span>
                            </label>
                        </div>

                        {/* Campos condicionales para regalo */}
                        {formData.esRegalo && (
                            <div className="regalo-fields">
                                <h4 className="regalo-subtitle">Datos del destinatario</h4>
                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label htmlFor="nombreRegalo-desktop" className="checkout-form-label">
                                            Nombre del destinatario *
                                        </label>
                                        <input
                                            id="nombreRegalo-desktop"
                                            name="nombreRegalo"
                                            type="text"
                                            value={formData.nombreRegalo}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.nombreRegalo ? 'checkout-input-error' : ''}`}
                                            placeholder="Nombre"
                                            autoComplete="given-name"
                                        />
                                        {errors.nombreRegalo && <span className="checkout-form-error">{errors.nombreRegalo}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="apellidoRegalo-desktop" className="checkout-form-label">
                                            Apellido del destinatario *
                                        </label>
                                        <input
                                            id="apellidoRegalo-desktop"
                                            name="apellidoRegalo"
                                            type="text"
                                            value={formData.apellidoRegalo}
                                            onChange={handleInputChange}
                                            className={`checkout-form-input ${errors.apellidoRegalo ? 'checkout-input-error' : ''}`}
                                            placeholder="Apellido"
                                            autoComplete="family-name"
                                        />
                                        {errors.apellidoRegalo && <span className="checkout-form-error">{errors.apellidoRegalo}</span>}
                                    </div>
                                </div>

                                <div className="checkout-form-group">
                                    <label htmlFor="dedicatoria-desktop" className="checkout-form-label">
                                        Dedicatoria o mensaje (Opcional)
                                    </label>
                                    <textarea
                                        id="dedicatoria-desktop"
                                        name="dedicatoria"
                                        value={formData.dedicatoria}
                                        onChange={handleInputChange}
                                        className="checkout-form-textarea"
                                        placeholder="Escribí el mensaje que queriés que reciba esa persona..."
                                        rows="3"
                                        maxLength={500}
                                    />
                                    <span className="checkout-form-hint">{formData.dedicatoria.length}/500</span>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Shipping Address */}
                    <div className="checkout-form-section">
                        <h3 className="checkout-section-title">Dirección de Envío</h3>
                        <div className="checkout-form-row">
                            <div className="checkout-form-group">
                                <label htmlFor="pais-desktop" className="checkout-form-label">
                                    País
                                </label>
                                <input
                                    id="pais-desktop"
                                    name="pais"
                                    type="text"
                                    value="Argentina"
                                    readOnly
                                    className="checkout-form-input checkout-input-readonly"
                                />
                            </div>

                            <div className="checkout-form-group">
                                <label htmlFor="provincia-desktop" className="checkout-form-label">
                                    Provincia *
                                </label>
                                <select
                                    id="provincia-desktop"
                                    name="provincia"
                                    value={formData.provincia}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.provincia ? 'checkout-input-error' : ''}`}
                                >
                                    <option value="">Seleccioná una provincia</option>
                                    {PROVINCIAS_ARGENTINA.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                {errors.provincia && <span className="checkout-form-error">{errors.provincia}</span>}
                            </div>
                        </div>

                        <div className="checkout-form-row">
                            <div className="checkout-form-group">
                                <label htmlFor="ciudad-desktop" className="checkout-form-label">
                                    Ciudad *
                                </label>
                                <input
                                    id="ciudad-desktop"
                                    name="ciudad"
                                    type="text"
                                    value={formData.ciudad}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.ciudad ? 'checkout-input-error' : ''}`}
                                    placeholder="Tu ciudad"
                                    autoComplete="address-level2"
                                />
                                {errors.ciudad && <span className="checkout-form-error">{errors.ciudad}</span>}
                            </div>

                            <div className="checkout-form-group">
                                <label htmlFor="codigoPostal-desktop" className="checkout-form-label">
                                    Código Postal *
                                </label>
                                <input
                                    id="codigoPostal-desktop"
                                    name="codigoPostal"
                                    type="text"
                                    value={formData.codigoPostal}
                                    onChange={handleInputChange}
                                    className={`checkout-form-input ${errors.codigoPostal ? 'checkout-input-error' : ''}`}
                                    placeholder="9120"
                                    autoComplete="postal-code"
                                />
                                {errors.codigoPostal && <span className="checkout-form-error">{errors.codigoPostal}</span>}
                            </div>
                        </div>

                        <div className="checkout-form-group">
                            <label htmlFor="direccion-desktop" className="checkout-form-label">
                                Dirección *
                            </label>
                            <input
                                id="direccion-desktop"
                                name="direccion"
                                type="text"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                className={`checkout-form-input ${errors.direccion ? 'checkout-input-error' : ''}`}
                                placeholder="Calle, número, piso, departamento"
                                autoComplete="street-address"
                            />
                            {errors.direccion && <span className="checkout-form-error">{errors.direccion}</span>}
                        </div>


                    </div>

                    {/* Additional Notes */}
                    <div className="checkout-form-section">
                        <div className="checkout-form-group">
                            <label htmlFor="notas-desktop" className="checkout-form-label">
                                Notas del Pedido (Opcional)
                            </label>
                            <textarea
                                id="notas-desktop"
                                name="notas"
                                value={formData.notas}
                                onChange={handleInputChange}
                                className="checkout-form-textarea"
                                placeholder="Información adicional sobre la entrega..."
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="checkout-form-actions">
                        <button
                            type="button"
                            className="checkout-btn-back"
                            onClick={onBack}
                            disabled={isSubmitting}
                        >
                            <i className="bi bi-arrow-left"></i>
                            Volver al Carrito
                        </button>

                        <button
                            type="submit"
                            className="checkout-btn-continue"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="checkout-spinner"></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Continuar al Pago
                                    <i className="bi bi-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CheckoutForm;