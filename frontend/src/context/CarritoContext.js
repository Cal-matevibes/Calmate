import React, { createContext, useState, useEffect, useContext } from 'react';
import carritoService from '../services/carritoService';

export const CarritoContext = createContext({
    carrito: [],
    loading: false,
    error: null,
    total: 0,
    cantidadTotal: 0,
    esRegalo: false,
    destinatarioRegalo: { nombre: '', apellido: '' },
    agregarAlCarrito: () => {},
    eliminarDelCarrito: () => {},
    vaciarCarrito: () => {},
    actualizarCantidad: () => {},
    cargarCarrito: () => {},
    validarCarrito: () => {},
    sincronizarCarrito: () => {},
    actualizarInfoRegalo: () => {}
});

// Hook personalizado para usar el contexto
export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
    }
    return context;
};

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);
    const [esRegalo, setEsRegalo] = useState(false);
    const [destinatarioRegalo, setDestinatarioRegalo] = useState({ nombre: '', apellido: '' });

    // Obtener token del usuario si está logueado
    const getToken = () => {
        try {
            return localStorage.getItem('token');
        } catch {
            return null;
        }
    };

    // Verificar si el usuario está autenticado
    const isUserAuthenticated = () => {
        return !!getToken();
    };

    // Cargar carrito del localStorage (para invitados)
    const cargarCarritoLocal = () => {
        try {
            const carritoLocal = localStorage.getItem('carrito_invitado');
            if (carritoLocal) {
                const carritoData = JSON.parse(carritoLocal);
                const items = carritoData.items || [];
                setCarrito(items);
                calcularTotales(items);
                
                // Cargar información de regalo
                setEsRegalo(carritoData.esRegalo || false);
                setDestinatarioRegalo(carritoData.destinatarioRegalo || { nombre: '', apellido: '' });
                
                return carritoData;
            } else {
                setCarrito([]);
                setTotal(0);
                setCantidadTotal(0);
                setEsRegalo(false);
                setDestinatarioRegalo({ nombre: '', apellido: '' });
                return { items: [], esRegalo: false, destinatarioRegalo: { nombre: '', apellido: '' } };
            }
        } catch (error) {
            console.error('Error cargando carrito local:', error);
            setCarrito([]);
            setTotal(0);
            setCantidadTotal(0);
            setEsRegalo(false);
            setDestinatarioRegalo({ nombre: '', apellido: '' });
            return { items: [], esRegalo: false, destinatarioRegalo: { nombre: '', apellido: '' } };
        }
    };

    // Guardar carrito en localStorage (para invitados)
    const guardarCarritoLocal = (items, regaloInfo = null) => {
        try {
            const carritoData = {
                items: items,
                timestamp: Date.now(),
                esRegalo: regaloInfo?.esRegalo || esRegalo,
                destinatarioRegalo: regaloInfo?.destinatarioRegalo || destinatarioRegalo
            };
            localStorage.setItem('carrito_invitado', JSON.stringify(carritoData));
        } catch (error) {
            console.error('Error guardando carrito local:', error);
        }
    };

    // Calcular totales
    const calcularTotales = (items) => {
        // Verificar que items sea un array válido
        if (!Array.isArray(items)) {
            setTotal(0);
            setCantidadTotal(0);
            return { total: 0, cantidadTotal: 0 };
        }

        const nuevoTotal = items.reduce((sum, item) => {
            const precio = item.precioVenta || item.precioUnitario || 0;
            return sum + (precio * item.cantidad);
        }, 0);
        const nuevaCantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);
        
        setTotal(nuevoTotal);
        setCantidadTotal(nuevaCantidadTotal);
        
        return { total: nuevoTotal, cantidadTotal: nuevaCantidadTotal };
    };

    // Cargar carrito al inicializar
    useEffect(() => {
        cargarCarrito();
    }, []);

    // Función para cargar carrito (API o localStorage según autenticación)
    const cargarCarrito = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (isUserAuthenticated()) {
                // Usuario autenticado: cargar desde API
                await cargarCarritoAPI();
            } else {
                // Usuario invitado: cargar desde localStorage
                cargarCarritoLocal();
            }
        } catch (err) {
            console.error('Error cargando carrito:', err);
            setError('Error al cargar el carrito');
            // Fallback a carrito local si falla la API
            cargarCarritoLocal();
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar carrito desde la API (usuarios autenticados)
    const cargarCarritoAPI = async () => {
        const token = getToken();
        const response = await carritoService.obtenerCarrito(token);
        
        if (response.success) {
            const carritoData = response.data;
            const items = carritoData.items || [];
            
            console.log('🛒 Items originales:', items);
            
            // Aplanar la estructura para que sea más fácil de usar en el frontend
            const itemsAplanados = items.map(item => {
                // Si el item tiene producto poblado, fusionar los datos
                if (item.producto) {
                    return {
                        _id: item.producto._id,
                        id: item.producto._id,
                        nombre: item.producto.nombre,
                        precioVenta: item.producto.precioVenta,
                        precioUnitario: item.precioUnitario,
                        // Procesar imágenes correctamente
                        imagenes: item.producto.imagenes || [],
                        // Para compatibilidad, agregar también la primera imagen como string
                        imagen: item.producto.imagenes?.[0]?.url || item.producto.imagenes?.[0] || null,
                        categoria: item.producto.categoria,
                        stock: item.producto.stock,
                        cantidad: item.cantidad,
                        // Mantener referencia original
                        itemOriginal: item
                    };
                } else {
                    // Si no hay producto poblado, usar los datos directos
                    return {
                        ...item,
                        id: item._id || item.id
                    };
                }
            });
            
            console.log('🛒 Items aplanados:', itemsAplanados);
            
            // Debug: Verificar estructura de imágenes y precios
            itemsAplanados.forEach(item => {
                console.log('📦 Item procesado:', {
                    nombre: item.nombre,
                    precioVenta: item.precioVenta,
                    precioUnitario: item.precioUnitario,
                    imagen: item.imagen,
                    imagenes: item.imagenes
                });
            });
            
            setCarrito(itemsAplanados);
            setTotal(carritoData.total || 0);
            setCantidadTotal(carritoData.cantidadTotalItems || 0);
            
            // Actualizar información de regalo
            setEsRegalo(carritoData.esRegalo || false);
            setDestinatarioRegalo(carritoData.destinatarioRegalo || { nombre: '', apellido: '' });
            
            console.log('🛒 Carrito cargado:', carritoData);
        }
    };

    // Agregar producto al carrito (usuarios autenticados y invitados)
    const agregarAlCarrito = async (producto) => {
        try {
            setLoading(true);
            setError(null);
            
            const token = getToken();
            const productoId = producto._id || producto.id;
            const cantidad = producto.cantidad || 1;
            
            console.log('🛒 Agregando al carrito:', { productoId, cantidad, autenticado: !!token });
            
            if (isUserAuthenticated()) {
                // Usuario autenticado: usar API
                const response = await carritoService.agregarProducto(productoId, cantidad, token);
                
                if (response.success) {
                    // Recargar carrito después de agregar
                    await cargarCarrito();
                    console.log('✅ Producto agregado al carrito (API)');
                    return { success: true };
                }
            } else {
                // Usuario invitado: usar localStorage
                const carritoLocal = (cargarCarritoLocal().items || []);
                
                // Buscar si el producto ya existe en el carrito
                const itemExistente = carritoLocal.find(item => item._id === productoId || item.id === productoId);
                
                if (itemExistente) {
                    // Si existe, aumentar cantidad
                    itemExistente.cantidad += cantidad;
                } else {
                    // Si no existe, agregar nuevo item
                    const nuevoItem = {
                        _id: productoId,
                        id: productoId,
                        nombre: producto.nombre,
                        precioVenta: producto.precioVenta,
                        precioUnitario: producto.precioVenta,
                        imagen: producto.imagenes?.[0]?.url || producto.imagenes?.[0] || producto.imagen,
                        imagenes: producto.imagenes || [],
                        categoria: producto.categoria,
                        stock: producto.stock,
                        cantidad: cantidad
                    };
                    carritoLocal.push(nuevoItem);
                }
                
                // Guardar en localStorage
                guardarCarritoLocal(carritoLocal);
                
                // Actualizar estado
                setCarrito(carritoLocal);
                const { total, cantidadTotal } = calcularTotales(carritoLocal);
                setTotal(total);
                setCantidadTotal(cantidadTotal);
                
                console.log('✅ Producto agregado al carrito (localStorage)');
                return { success: true };
            }
        } catch (err) {
            console.error('❌ Error agregando al carrito:', err);
            setError('Error al agregar producto al carrito');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Actualizar cantidad de un producto (usuarios autenticados y invitados)
    const actualizarCantidad = async (productoId, nuevaCantidad) => {
        try {
            setLoading(true);
            setError(null);
            
            const token = getToken();
            
            console.log('🛒 Actualizando cantidad:', { productoId, nuevaCantidad, autenticado: !!token });
            
            if (isUserAuthenticated()) {
                // Usuario autenticado: usar API
                const response = await carritoService.actualizarCantidad(productoId, nuevaCantidad, token);
                
                if (response.success) {
                    // Recargar carrito después de actualizar
                    await cargarCarrito();
                    console.log('✅ Cantidad actualizada (API)');
                    return { success: true };
                }
            } else {
                // Usuario invitado: usar localStorage
                const carritoLocal = (cargarCarritoLocal().items || []);
                
                // Buscar el item y actualizar cantidad
                const itemIndex = carritoLocal.findIndex(item => 
                    item._id === productoId || item.id === productoId
                );
                
                if (itemIndex !== -1) {
                    if (nuevaCantidad <= 0) {
                        // Si la cantidad es 0 o menos, eliminar el item
                        carritoLocal.splice(itemIndex, 1);
                    } else {
                        // Actualizar cantidad
                        carritoLocal[itemIndex].cantidad = nuevaCantidad;
                    }
                    
                    // Guardar en localStorage
                    guardarCarritoLocal(carritoLocal);
                    
                    // Actualizar estado
                    setCarrito(carritoLocal);
                    const { total, cantidadTotal } = calcularTotales(carritoLocal);
                    setTotal(total);
                    setCantidadTotal(cantidadTotal);
                    
                    console.log('✅ Cantidad actualizada (localStorage)');
                    return { success: true };
                }
            }
        } catch (err) {
            console.error('❌ Error actualizando cantidad:', err);
            setError('Error al actualizar cantidad');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Eliminar producto del carrito
    const eliminarDelCarrito = async (productoId) => {
        try {
            setLoading(true);
            setError(null);
            
            const token = getToken();
            
            console.log('🛒 Eliminando del carrito:', productoId);

            if (isUserAuthenticated()) {
                // Usuario autenticado: usar API
                const response = await carritoService.eliminarProducto(productoId, token);
                if (response.success) {
                    await cargarCarrito();
                    console.log('✅ Producto eliminado del carrito (API)');
                    return { success: true };
                }
            } else {
                // Usuario invitado: usar localStorage
                const carritoLocal = (cargarCarritoLocal().items || []).filter(
                    item => item._id !== productoId && item.id !== productoId
                );
                guardarCarritoLocal(carritoLocal);
                setCarrito(carritoLocal);
                calcularTotales(carritoLocal);
                console.log('✅ Producto eliminado del carrito (localStorage)');
                return { success: true };
            }
        } catch (err) {
            console.error('❌ Error eliminando del carrito:', err);
            setError('Error al eliminar producto del carrito');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Vaciar todo el carrito (usuarios autenticados y invitados)
    const vaciarCarrito = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = getToken();
            
            console.log('🛒 Vaciando carrito:', { autenticado: !!token });
            
            if (isUserAuthenticated()) {
                // Usuario autenticado: usar API
                const response = await carritoService.limpiarCarrito(token);
                
                if (response.success) {
                    // Limpiar estado local
                    setCarrito([]);
                    setTotal(0);
                    setCantidadTotal(0);
                    console.log('✅ Carrito vaciado (API)');
                    return { success: true };
                }
            } else {
                // Usuario invitado: limpiar localStorage
                guardarCarritoLocal([]);
                
                // Limpiar estado local
                setCarrito([]);
                setTotal(0);
                setCantidadTotal(0);
                
                console.log('✅ Carrito vaciado (localStorage)');
                return { success: true };
            }
        } catch (err) {
            console.error('❌ Error vaciando carrito:', err);
            setError('Error al vaciar el carrito');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Validar carrito (verificar stock, precios)
    const validarCarrito = async () => {
        try {
            const token = getToken();
            const response = await carritoService.validarCarrito(token);
            return response;
        } catch (err) {
            console.error('❌ Error validando carrito:', err);
            return { success: false, error: err.message };
        }
    };

    // Sincronizar carrito local con el servidor cuando el usuario se autentica
    const sincronizarCarrito = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const carritoLocal = cargarCarritoLocal();
            
            // Si hay items en el carrito local, agregarlos al carrito del servidor
            if (carritoLocal && carritoLocal.length > 0) {
                console.log('🔄 Sincronizando carrito local con servidor:', carritoLocal);
                
                for (const item of carritoLocal) {
                    try {
                        await carritoService.agregarProducto(item._id || item.id, item.cantidad, token);
                    } catch (err) {
                        console.error('❌ Error sincronizando item:', item, err);
                    }
                }
                
                // Limpiar carrito local después de sincronizar
                guardarCarritoLocal([]);
                
                // Recargar carrito desde el servidor
                await cargarCarrito();
                
                console.log('✅ Carrito sincronizado exitosamente');
            }
        } catch (err) {
            console.error('❌ Error sincronizando carrito:', err);
        }
    };

    // Actualizar información de regalo del carrito
    const actualizarInfoRegalo = async (esRegaloProp, nombreRegalo = '', apellidoRegalo = '', dedicatoria = '') => {
        if (loading) return;
        
        setLoading(true);
        setError(null);

        try {
            if (isUserAuthenticated()) {
                // Usuario autenticado - actualizar en servidor
                const token = getToken();
                const response = await carritoService.actualizarInfoRegalo(
                    esRegaloProp, 
                    nombreRegalo, 
                    apellidoRegalo,
                    dedicatoria,
                    token
                );
                
                if (response.success) {
                    // Recargar carrito para obtener datos actualizados
                    await cargarCarrito();
                }
            } else {
                // Usuario invitado - guardar en localStorage
                const regaloInfo = {
                    esRegalo: esRegaloProp,
                    destinatarioRegalo: {
                        nombre: nombreRegalo || '',
                        apellido: apellidoRegalo || '',
                        dedicatoria: dedicatoria || ''
                    }
                };
                
                // Actualizar estado local
                setEsRegalo(esRegaloProp);
                setDestinatarioRegalo(regaloInfo.destinatarioRegalo);
                
                // Guardar en localStorage
                guardarCarritoLocal(carrito, regaloInfo);
            }
            
            console.log('✅ Información de regalo actualizada');
        } catch (err) {
            console.error('❌ Error actualizando información de regalo:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        // Estado
        carrito,
        loading,
        error,
        total,
        cantidadTotal,
        esRegalo,
        destinatarioRegalo,
        
        // Funciones
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        actualizarCantidad,
        cargarCarrito,
        validarCarrito,
        sincronizarCarrito,
        actualizarInfoRegalo
    };

    return (
        <CarritoContext.Provider value={value}>
            {children}
        </CarritoContext.Provider>
    );
};