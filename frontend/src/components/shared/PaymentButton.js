import React from 'react';

function PaymentButton({ items }) {
  const handlePayment = async () => {
    try {
      // Crear la preferencia de pago
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create_preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      // Inicializar el Checkout Pro de Mercado Pago
      const mp = new window.MercadoPago('TU_PUBLIC_KEY', {
        locale: 'es-AR', // Cambia según tu región
      });

      mp.checkout({
        preference: {
          id: data.id,
        },
        autoOpen: true, // Abre el Checkout automáticamente
      });
    } catch (error) {
    }
  };

  return (
    <button onClick={handlePayment} className="payment-button">
      Pagar con Mercado Pago
    </button>
  );
}

export default PaymentButton;