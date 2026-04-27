import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext.js';
import Header from './Header.js';
import Footer from './Footer.js';
import EmptyState from './EmptyState.js';
// import WhatsAppCompra from './WhatsAppCompra.js'; // Commented out - not currently used
import PopupRedireccion from './PopupRedireccion.js'; // Importa el popup
import '../styles/Carrito.css';

function Carrito() {
    const { carrito, eliminarDelCarrito, vaciarCarrito, actualizarCantidad, total: carritoTotal } = useCarrito();
    const [mostrarPopup, setMostrarPopup] = useState(false); // Estado para mostrar el popup

    const total = carritoTotal || carrito.reduce((sum, item) => {
        const precio = item.precioUnitario || item.precioVenta || item.precio || 0;
        return sum + precio * item.cantidad;
    }, 0);

    // Función para generar el mensaje de WhatsApp
    const generarMensajeWhatsApp = () => {
        let mensaje = '¡Hola! Me gustaría realizar una compra con los siguientes productos:\n\n';
        carrito.forEach((item) => {
            mensaje += `- ${item.nombre} (Cantidad: ${item.cantidad}, Precio: $${item.precioVenta})\n`;
        });
        mensaje += `\nTotal: $${total}`;
        return mensaje;
    };

    // Función para manejar el clic en el botón de pagar
    const handlePagar = () => {
        setMostrarPopup(true); // Muestra el popup
    };

    // Función para redirigir a WhatsApp
    const redirigirAWhatsApp = () => {
        const mensaje = generarMensajeWhatsApp();
        const numeroWhatsApp = '5492804666566'; // Número de WhatsApp al que se enviará el mensaje
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank'); // Abre el enlace en una nueva pestaña
        setMostrarPopup(false); // Oculta el popup después de redirigir
    };

    return (
        <div className="carritoPage">
            <Header />
            <div className="carritoContent">
                <div className="carrito">
                    <h2>Carrito de Compras</h2>
                    {carrito.length === 0 ? (
                        <EmptyState message="Tu carrito está vacío. ¡Agrega productos para comenzar!" />
                    ) : (
                        <>
                            <ul>
                                {carrito.map((item) => (
                                    <li key={item.id}>
                                        <img src={item.imagenes?.[0]?.url || item.imagen || '/placeholder.svg'} alt={item.nombre} />
                                        <span>{item.nombre}</span>
                                        <span>${item.precioVenta}</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) =>
                                                actualizarCantidad(item.id, Number(e.target.value))
                                            }
                                            className="carrito-quantity-input"
                                        />
                                        <button onClick={() => eliminarDelCarrito(item.id)}>Eliminar</button>
                                    </li>
                                ))}
                            </ul>
                            <h3>Total: ${total}</h3>
                            <div className="carritoButtons">
                                <button onClick={vaciarCarrito}>Vaciar Carrito</button>
                                <button onClick={handlePagar} className="pagarButton">
                                    Pagar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {mostrarPopup && (
                <PopupRedireccion
                    mensaje="Serás redirigido a WhatsApp para finalizar tu compra."
                    onRedirigir={redirigirAWhatsApp}
                    onClose={() => setMostrarPopup(false)} // Cierra el popup manualmente
                />
            )}
            <Footer />
        </div>
    );
}

export default Carrito;