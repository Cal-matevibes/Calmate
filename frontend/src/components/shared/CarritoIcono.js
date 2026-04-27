import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext.js';
import '../styles/CarritoIcono.css';

function CarritoIcono() {
  const { carrito, cantidadTotal } = useCarrito();
  const [animateCart, setAnimateCart] = useState(false); // Estado para animar el contador

  // Animación del contador del carrito
  useEffect(() => {
    if ((cantidadTotal || (carrito && carrito.length)) > 0) {
      setAnimateCart(true);
      const timeout = setTimeout(() => setAnimateCart(false), 500); // Duración de la animación
      return () => clearTimeout(timeout);
    }
  }, [cantidadTotal, carrito]);

  // Usar cantidadTotal del contexto o calcular desde el array de items
  const totalItems = cantidadTotal || (carrito ? carrito.reduce((total, item) => total + (item.cantidad || 1), 0) : 0);

  return (
    <Link to="/cart" className="carrito-icono" aria-label="Ir al carrito">
      <i className="bi bi-cart3"></i>
      <span className={`cart-counter ${animateCart ? 'animate' : ''}`}>
        {totalItems}
      </span>
    </Link>
  );
}

export default CarritoIcono;