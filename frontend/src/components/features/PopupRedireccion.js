import React, { useEffect, useState } from 'react';
import './styles/PopupRedireccion.css';

function PopupRedireccion({ mensaje, onRedirigir, onClose }) {
  const [contador, setContador] = useState(5); // Temporizador inicial de 5 segundos

  useEffect(() => {
    // Disminuye el contador cada segundo
    const interval = setInterval(() => {
      setContador((prev) => prev - 1);
    }, 1000);

    // Redirige cuando el contador llega a 0
    if (contador === 0) {
      clearInterval(interval);
      onRedirigir(); // Llama a la función de redirección
    }

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [contador, onRedirigir]);

  // Función para cancelar la redirección
  const handleCancelar = () => {
    setContador(0); // Detiene el temporizador
    onClose(); // Cierra el popup
  };

  return (
    <div className="popup-redireccion">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>
        <p>{mensaje}</p>
        <p className='redireccion'>Redirigiendo en {contador} segundos...</p>
        <div className="popup-buttons">
          <button className="popup-cancelar" onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopupRedireccion;