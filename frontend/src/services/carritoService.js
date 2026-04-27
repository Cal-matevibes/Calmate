const BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

const carritoService = {
  // Obtener carrito del usuario actual
  obtenerCarrito: async (token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Si hay token, agregarlo para usuarios autenticados
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Para usuarios invitados, usar session ID
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos`, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener carrito');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerCarrito:', error);
      throw error;
    }
  },

  // Agregar producto al carrito
  agregarProducto: async (productoId, cantidad = 1, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos/agregar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productoId,
          cantidad
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agregar producto al carrito');
      }

      return data;
    } catch (error) {
      console.error('Error en agregarProducto:', error);
      throw error;
    }
  },

  // Actualizar cantidad de un producto en el carrito
  actualizarCantidad: async (productoId, cantidad, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos/actualizar`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          productoId,
          cantidad
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar cantidad');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarCantidad:', error);
      throw error;
    }
  },

  // Eliminar producto del carrito
  eliminarProducto: async (productoId, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos/eliminar/${productoId}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar producto del carrito');
      }

      return data;
    } catch (error) {
      console.error('Error en eliminarProducto:', error);
      throw error;
    }
  },

  // Limpiar todo el carrito
  limpiarCarrito: async (token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos/limpiar`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al limpiar carrito');
      }

      return data;
    } catch (error) {
      console.error('Error en limpiarCarrito:', error);
      throw error;
    }
  },

  // Validar carrito (verificar stock, precios)
  validarCarrito: async (token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos/validar`, {
        method: 'GET',
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al validar carrito');
      }

      return data;
    } catch (error) {
      console.error('Error en validarCarrito:', error);
      throw error;
    }
  },

  // Actualizar información de regalo del carrito
  actualizarInfoRegalo: async (esRegalo, nombreRegalo = '', apellidoRegalo = '', dedicatoria = '', token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        headers['x-session-id'] = sessionId;
      }

      const response = await fetch(`${BASE_URL}/carritos/regalo`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          esRegalo,
          nombreRegalo,
          apellidoRegalo,
          dedicatoria
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar información de regalo');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarInfoRegalo:', error);
      throw error;
    }
  }
};

export default carritoService;