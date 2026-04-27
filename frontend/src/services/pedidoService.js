const pedidoService = {
  // Obtener todos los pedidos (solo admin)
  obtenerTodosPedidos: async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pedidos');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodosPedidos:', error);
      throw error;
    }
  },

  // Obtener mis pedidos (usuario)
  obtenerMisPedidos: async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/mis-pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener mis pedidos');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerMisPedidos:', error);
      throw error;
    }
  },

  // Obtener pedido específico
  obtenerPedido: async (id, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pedido');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPedido:', error);
      throw error;
    }
  },

  // Actualizar estado del pedido (solo admin)
  actualizarEstadoPedido: async (id, estado, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar estado');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarEstadoPedido:', error);
      throw error;
    }
  },

  // Obtener estadísticas (solo admin)
  obtenerEstadisticas: async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      throw error;
    }
  },

  // Procesar pago (solo admin)
  procesarPago: async (id, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/${id}/procesar-pago`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar pago');
      }

      return data;
    } catch (error) {
      console.error('Error en procesarPago:', error);
      throw error;
    }
  },

  // Cancelar pedido
  cancelarPedido: async (id, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/${id}/cancelar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cancelar pedido');
      }

      return data;
    } catch (error) {
      console.error('Error en cancelarPedido:', error);
      throw error;
    }
  }
};

export default pedidoService;