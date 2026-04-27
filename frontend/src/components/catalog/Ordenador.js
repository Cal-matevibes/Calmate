import React from 'react';
import '../styles/Ordenador.css';

function Ordenador({ items, onSort }) {
  const handleSort = (e) => {
    const value = e.target.value;
    let sortedItems = [...items];
    if (value === 'asc') {
      sortedItems.sort((a, b) => a.precioVenta - b.precioVenta);
    } else if (value === 'desc') {
      sortedItems.sort((a, b) => b.precioVenta - a.precioVenta);
    }
    onSort(sortedItems);
  };

  return (
    <div className="ordenador">
      <select onChange={handleSort} className="ordenador-select">
        <option value="">Ordenar por</option>
        <option value="asc">Precio: Menor a Mayor</option>
        <option value="desc">Precio: Mayor a Menor</option>
      </select>
    </div>
  );
}

export default Ordenador;