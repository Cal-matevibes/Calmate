// src/pages/Contact.js
import React, { useEffect, useContext } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Header from '../components/layout/Header.js';
import Footer from '../components/layout/Footer.js';
import Content from '../components/layout/Content.js';
import InstagramFeed from '../components/home/InstagramFeed.js';
import WhatsappButton from '../components/shared/WhatsappButton.js';
import { CarritoContext } from '../context/CarritoContext.js';
import './styles/Contact.css';

function Contact() {
  const { carrito } = useContext(CarritoContext);
  
  useEffect(() => {
    AOS.init({ 
      duration: 400, 
      once: true,
      offset: 50,
      easing: 'ease',
      disable: 'mobile' // Deshabilitar en móviles para evitar problemas
    });
  }, []);

  return (
    <div className="contact-page-wrapper">
      <Header carrito={carrito} userRole="client" />
      
      {/* Hero Section */}
      <div className="contact-hero-section">
        <div className="contact-content-container">
          <h1 className="contact-hero-title">Contactanos</h1>          
        </div>
      </div>

      <div className="contact-content-container">
        {/* Instagram Section */}
        <div className="contact-section instagram-section">
          <Content
            title="Seguinos en Instagram"
            lead="Descubrí nuestros productos, novedades y el mundo del mate"
            colorTitle='#52691a'
            colorLead='#52691a'
          />
          <InstagramFeed background="#b7c774" />
        </div>

        {/* WhatsApp Section */}
        <div className="contact-section whatsapp-section">
          <Content
            title="Contactanos por WhatsApp"
            lead="¿Tenés alguna consulta? ¡Escribinos y te respondemos al instante!"
            colorTitle='#ffffff'
            colorLead='#ffffff'
          >
            <WhatsappButton text="Enviar mensaje" />
          </Content>
        </div>

        {/* Additional Contact Methods Section */}
        <div className="contact-section">
          <Content
            title="Otras formas de contacto"
            lead="También podés encontrarnos en"
            colorTitle='#52691a'
            colorLead='#666666'
          >
            <div className="contact-info-grid">
              <div className="contact-info-item">
                <i className="bi bi-envelope-fill"></i>
                <span>calmate834@gmail.com</span>
              </div>
              <div className="contact-info-item">
                <i className="bi bi-telephone-fill"></i>
                <span>+54 280 466-6566</span>
              </div>
              <div className="contact-info-item">
                <i className="bi bi-geo-alt-fill"></i>
                <span>Trelew, Chubut</span>
              </div>
            </div>
          </Content>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;
