const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const nodoCuidadoService = {
  getAll: async (categoriaId) => {
    const res = await fetch(`${BASE_URL}/nodos-cuidado?categoriaId=${categoriaId}`);
    if (!res.ok) throw new Error('Error al obtener nodos de cuidado');
    return res.json();
  },

  crear: async (payload, authHeaders) => {
    const res = await fetch(`${BASE_URL}/nodos-cuidado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al crear nodo');
    return res.json();
  },

  actualizar: async (id, payload, authHeaders) => {
    const res = await fetch(`${BASE_URL}/nodos-cuidado/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al actualizar nodo');
    return res.json();
  },

  eliminar: async (id, authHeaders) => {
    const res = await fetch(`${BASE_URL}/nodos-cuidado/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
    if (!res.ok) throw new Error('Error al eliminar nodo');
    return res.json();
  }
};

export default nodoCuidadoService;
