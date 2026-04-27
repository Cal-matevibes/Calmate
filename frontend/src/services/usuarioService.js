const usuarioService = {
  obtenerUsuarios: async (token, { buscar = '', rol = '', page = 1 } = {}) => {
    const params = new URLSearchParams({ page, limit: 50 });
    if (buscar) params.append('buscar', buscar);
    if (rol) params.append('rol', rol);

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/usuarios?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener usuarios');
    return data;
  },

  cambiarRol: async (token, userId, nuevoRol) => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/usuarios/${userId}/rol`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rol: nuevoRol })
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al cambiar el rol');
    return data;
  }
};

export default usuarioService;
