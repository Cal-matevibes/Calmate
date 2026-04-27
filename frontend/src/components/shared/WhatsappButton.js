import React from 'react';
import '../styles/WhatsappButton.css';

function WhatsappButton({ text = "Abrir en WhatsApp" }) {
  return (
    <a
      href="https://wa.me/5492804666566?text=Quisiera%20saber%20mas%20acerca%20de..."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn-pill"
    >
      <i className="bi bi-whatsapp"></i>
      {text}
    </a>
  );
}

export default WhatsappButton;