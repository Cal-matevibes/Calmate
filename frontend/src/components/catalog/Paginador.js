import React from 'react';
import '../styles/Paginador.css';

function Paginador({ totalItems, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="paginador">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          className={`paginador-button ${currentPage === index + 1 ? 'active' : ''}`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}

export default Paginador;