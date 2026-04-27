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
      console.error('Error en obtenerCategorias:', error);
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
      console.error('Error en obtenerCategoria:', error);
      throw error;
    }
  },

  // Crear nueva categoría
  crearCategoria: async (categoriaData, token) => {
    try {
      console.log('📤 Enviando datos al backend (crear):', JSON.stringify(categoriaData, null, 2));
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
      console.error('Error en crearCategoria:', error);
      throw error;
    }
  },

  // Actualizar categoría
  actualizarCategoria: async (id, categoriaData, token) => {
    try {
      console.log('📤 Enviando datos al backend (actualizar):', JSON.stringify(categoriaData, null, 2));
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
      console.error('Error en actualizarCategoria:', error);
      throw error;
    }
  },

  // Eliminar categoría
  eliminarCategoria: async (id, token) => {
    try {
      console.log(`🗑️ Enviando DELETE request para categoría ID: ${id}`);
      console.log(`🔐 Token: ${token ? 'Presente' : 'Ausente'}`);
      console.log(`🌐 URL: ${process.env.REACT_APP_BACKEND_URL}/categorias/${id}`);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log(`📦 Response data:`, data);
      
      if (!response.ok) {
        console.error(`❌ Request failed with status ${response.status}:`, data);
        throw new Error(data.message || 'Error al eliminar categoría');
      }

      console.log(`✅ DELETE request successful:`, data);
      return data;
    } catch (error) {
      console.error('❌ Error en eliminarCategoria:', error);
      throw error;
    }
  }
};

export default categoriaService;