const categoriaService = {
  // Obtener todas las categorías
  obtenerCategorias: async (filtros = {}) => {
    try {
      const queryParams = new URLSearchParams(filtros);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/categorias?${queryParams}`);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener categorías');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una categoría por ID
  obtenerCategoria: async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/categorias/${id}`);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener categoría');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva categoría
  crearCategoria: async (categoriaData, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoriaData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear categoría');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar categoría
  actualizarCategoria: async (id, categoriaData, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoriaData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar categoría');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar categoría
  eliminarCategoria: async (id, token) => {
    try {
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar categoría');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default categoriaService;