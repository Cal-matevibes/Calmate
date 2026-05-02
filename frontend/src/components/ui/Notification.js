import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/Notification.css';

function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Cierra la notificación automáticamente después de 3 segundos
    }, 3000);

    return () => clearTimeout(timer); // Limpia el temporizador al desmontar
  }, [onClose]);

  const notificationContent = (
    <div className="notification">
      <div className="notification-content">
        <div className="notification-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="notification-message">{message}</p>
      </div>
    </div>
  );

  return createPortal(notificationContent, document.body);
}

export default Notification;