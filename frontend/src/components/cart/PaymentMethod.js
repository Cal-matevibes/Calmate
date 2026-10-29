import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext';
import { calcularCostoEnvio } from '../../utils/shipping';
import './styles/PaymentMethod.css';

const PaymentMethod = ({
  onNext,
  onBack,
  customerInfo,
  onMercadoPagoPayment,
  isLoading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');

  // Obtener datos del carrito
  const { carrito, total: totalContexto } = useCarrito();

  // Recalcular a partir de los items actuales: el total del contexto puede quedar desincronizado
  const totalCalculado = (carrito || []).reduce((sum, item) => {
    const precio = item.precioUnitario || item.precioVenta || item.precio || 0;
    return sum + precio * item.cantidad;
  }, 0);
  const total = carrito && carrito.length > 0 ? totalCalculado : (totalContexto || 0);
  const envio = calcularCostoEnvio(carrito, total);
  const totalAPagar = total + envio;

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleWhatsAppContact = () => {
    // Preparar mensaje para WhatsApp
    const items = carrito.map(item =>
      `• ${item.nombre} x${item.cantidad} - $${(item.precioVenta * item.cantidad).toLocaleString()}`
    ).join('\n');

    const customerName = customerInfo?.nombre || 'Cliente';
    const customerApellido = customerInfo?.apellido || '';
    const customerEmail = customerInfo?.email || '';
    const customerPhone = customerInfo?.telefono || '';
    const customerAddress = customerInfo?.direccion || '';
    const customerCity = customerInfo?.ciudad || '';

    // Preparar información de cliente y destinatario
    let customerDetails = '';
    
    if (customerInfo?.esRegalo) {
      // Es un regalo - mostrar comprador y destinatario
      const compradorName = customerApellido ? `${customerName} ${customerApellido}` : customerName;
      const destinatarioName = customerInfo.apellidoRegalo ? 
        `${customerInfo.nombreRegalo} ${customerInfo.apellidoRegalo}` : 
        customerInfo.nombreRegalo;
      
      customerDetails = `*🎁 ES UN REGALO*\n`;
      customerDetails += `*Comprador:* ${compradorName}\n`;
      customerDetails += `*Destinatario:* ${destinatarioName}\n`;
    } else {
      // Compra normal
      const fullName = customerApellido ? `${customerName} ${customerApellido}` : customerName;
      customerDetails = `*Cliente:* ${fullName}\n`;
    }
    
    if (customerEmail) customerDetails += `*Email:* ${customerEmail}\n`;
    if (customerPhone) customerDetails += `*Teléfono:* ${customerPhone}\n`;
    if (customerAddress) customerDetails += `*Dirección:* ${customerAddress}\n`;
    if (customerCity) customerDetails += `*Ciudad:* ${customerCity}\n`;

    const message = `¡Hola! Me interesa realizar una compra:\n\n${customerDetails}\n\n*Productos:*\n${items}\n\nSubtotal: $${total.toLocaleString()}\nEnvío: ${envio === 0 ? 'GRATIS' : `$${envio.toLocaleString()}`}\n*Total: $${(total + envio).toLocaleString()}*\n\n¿Podrían ayudarme con el proceso de compra?`;

    // Número de WhatsApp (reemplaza con tu número)
    const phoneNumber = '5492804666566'; // Formato: código país + número sin espacios ni símbolos

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleNext = () => {
    if (selectedMethod && onNext) {
      onNext({ paymentMethod: selectedMethod });
    }
  };

  return (
    <div className="payment-method">

      {/* Opciones de pago */}
      <div className="payment-options">
        <div
          className={`payment-card ${selectedMethod === 'mercadopago' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('mercadopago')}
        >
          <div className="payment-header">
            <input
              type="radio"
              name="paymentMethod"
              value="mercadopago"
              checked={selectedMethod === 'mercadopago'}
              onChange={() => handleMethodSelect('mercadopago')}
            />
            <h4>MercadoPago</h4>
          </div>
          <p>Pagá con tarjeta de crédito, débito o dinero en cuenta</p>
        </div>

        <div
          className={`payment-card ${selectedMethod === 'whatsapp' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('whatsapp')}
        >
          <div className="payment-header">
            <input
              type="radio"
              name="paymentMethod"
              value="whatsapp"
              checked={selectedMethod === 'whatsapp'}
              onChange={() => handleMethodSelect('whatsapp')}
            />
            <h4>Contacto por WhatsApp</h4>
          </div>
          <p>Coordiná tu compra directamente con nosotros</p>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="step-navigation">
        <button
          className="btn-secondary"
          onClick={onBack}
        >
          ← Volver
        </button>

        {selectedMethod === 'mercadopago' && (
          <div className="mercadopago-container">
            <button
              type="button"
              className="mercadopago-pay-button"
              onClick={onMercadoPagoPayment}
              disabled={isLoading || !carrito?.length || !onMercadoPagoPayment}
            >
              {isLoading ? 'Procesando pago...' : `Pagar $${totalAPagar.toLocaleString('es-AR')}`}
            </button>
          </div>
        )}

        {selectedMethod === 'whatsapp' && (
          <div className="whatsapp-container">
            <button
              className="whatsapp-btn"
              onClick={handleWhatsAppContact}
            >
              <span>Contactar por WhatsApp</span>
            </button>
          </div>
        )}

        {selectedMethod && selectedMethod !== 'mercadopago' && selectedMethod !== 'whatsapp' && (
          <button
            className="btn-primary"
            onClick={handleNext}
          >
            Continuar →
          </button>
        )}
      </div>

    </div>
  );
};

export default PaymentMethod;