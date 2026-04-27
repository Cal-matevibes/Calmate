import React, { useState } from 'react';
import '../styles/Filtros.css';

function Filtros({ items, onFilter }) {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filteredItems = items.filter((item) =>
      item.nombre.toLowerCase().includes(value)
    );
    onFilter(filteredItems);
  };

  return (
    <div className="filtros">
      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={handleSearch}
        className="filtros-input"
      />
    </div>
  );
}

export default Filtros;