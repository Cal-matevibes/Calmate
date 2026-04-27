import React from 'react';
import '../styles/WhatsappFloat.css';

function WhatsappFloat() {
    return (
        <a
            href="https://wa.me/5492804666566?text=Hola!%20Quisiera%20saber%20mas%20acerca%20de..."
            className="whatsapp-float"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Chat"
        >
            <i className="bi bi-whatsapp"></i>
        </a>
    );
}

export default WhatsappFloat;