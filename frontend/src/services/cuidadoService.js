const cuidadoService = {
    // Obtener todos los cuidados
    obtenerCuidados: async (categoria = null) => {
        try {
            let url = `${process.env.REACT_APP_BACKEND_URL}/cuidados`;
            if (categoria) {
                url += `?categoria=${categoria}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener cuidados');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener un cuidado específico
    obtenerCuidado: async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cuidados/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener el cuidado');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Crear un nuevo cuidado (solo admin)
    crearCuidado: async (cuidadoData, token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cuidados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cuidadoData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el cuidado');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar un cuidado (solo admin)
    actualizarCuidado: async (id, cuidadoData, token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cuidados/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cuidadoData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar el cuidado');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar un cuidado (solo admin)
    eliminarCuidado: async (id, token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cuidados/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar el cuidado');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default cuidadoService;