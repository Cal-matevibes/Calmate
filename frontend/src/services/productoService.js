const productoService = {
    // Obtener todos los productos con filtros
    obtenerProductos: async (filtros = {}) => {
        try {
            const queryParams = new URLSearchParams(filtros);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos?${queryParams}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener productos');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener productos por categoría
    obtenerProductosPorCategoria: async (categoria) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/categoria/${categoria}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener productos por categoría');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener producto específico
    obtenerProducto: async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/${id}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener producto');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Crear producto (solo admin)
    crearProducto: async (productoData, token) => {
        try {            
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productoData)
            });
            const data = await response.json();
            if (!response.ok) {
                
                // Manejar errores específicos
                let errorMessage = data.message || 'Error al crear producto';
                if (data.error && data.error.includes('E11000 duplicate key')) {
                    if (data.error.includes('slug_1 dup key')) {
                        errorMessage = 'Ya existe un producto con un nombre similar. Intenta con un nombre más específico.';
                    } else {
                        errorMessage = 'Ya existe un producto con estos datos. Verifica que no esté duplicado.';
                    }
                }
                
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar producto (solo admin)
    actualizarProducto: async (id, productoData, token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productoData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar producto');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar stock (solo admin)
    actualizarStock: async (id, nuevoStock, token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/${id}/stock`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stock: nuevoStock })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar stock');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar producto (solo admin)
    eliminarProducto: async (id, token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar producto');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Buscar productos
    buscarProductos: async (termino) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/search?q=${encodeURIComponent(termino)}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al buscar productos');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener resumen del inventario
    obtenerResumenInventario: async (token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos/resumen`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener resumen');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default productoService;