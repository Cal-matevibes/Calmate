import React from 'react';
import './styles/WhatsAppCompra.css';

function WhatsAppCompra({ items, total }) {
  // Función para generar el mensaje de WhatsApp
  const generarMensajeWhatsApp = () => {
    let mensaje = '¡Hola! Me gustaría realizar una compra con los siguientes productos:\n\n';
    items.forEach((item) => {
      mensaje += `- ${item.nombre} (Cantidad: ${item.cantidad}, Precio: $${item.precio})\n`;
    });
    mensaje += `\nTotal: $${total}`;
    return mensaje;
  };

  // Función para manejar el clic en el botón
  const handlePagar = () => {
    const mensaje = generarMensajeWhatsApp();
    const numeroWhatsApp = '5492804666566'; // Número de WhatsApp al que se enviará el mensaje
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank'); // Abre el enlace en una nueva pestaña
  };

  return (
    <button onClick={handlePagar} className="whatsapp-compra-button">
      Pagar
    </button>
  );
}

export default WhatsAppCompra;