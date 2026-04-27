import React, { useEffect, useRef, useState, useContext } from 'react';

import Header from '../components/layout/Header.js';
import Footer from '../components/layout/Footer.js';
import Content from '../components/layout/Content.js';
import Tienda from '../components/catalog/Tienda.js';
import InstagramFeed from '../components/home/InstagramFeed.js';
import HeroSection from '../components/features/Hero section.js';
import SectionDividerImage from '../components/home/SectionDividerImage.js';
import CuradosBanner from '../components/home/CuradosBanner.js';
import { CarritoContext } from '../context/CarritoContext.js';

import './styles/Home.css';

function Home() {
  const sectionRefs = useRef([]);
  // const [imagesLoaded, setImagesLoaded] = useState({}); // Commented out - not currently used
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { carrito } = useContext(CarritoContext);

  useEffect(() => {
    // Detectar preferencia de motion reducido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Sistema personalizado de animación en scroll con delays escalonados
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Animación escalonada solo si no prefiere motion reducido
          const delay = prefersReducedMotion ? 0 : index * 150;
          
          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, delay);
        }
      });
    }, observerOptions);

    // Observar todas las secciones
    const currentRefs = sectionRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [prefersReducedMotion]);

  return (
    <div className="home-page">
      <Header carrito={carrito} userRole="client" />
      <div className="home-container">
        <div className="home-inner-container">
          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[0] = el}
            style={{ animationDelay: '0ms' }}
          >
            <div className="hero-section">
              <HeroSection src="/cal.mate beige.png" alt="Javi disfrutando un mate en la playa - Bienvenido a CalmateVibes" />
            </div>
          </div>

          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[1] = el}
            style={{ animationDelay: '150ms' }}
          >
            <Tienda color1="#b7c774" />
          </div>

          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[2] = el}
            style={{ animationDelay: '300ms' }}
          >
            <SectionDividerImage 
              src="guarda.jpeg" 
              alt="Divisor decorativo animado - Separador de secciones" 
              height="50px" 
            />
          </div>

          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[3] = el}
            style={{ animationDelay: '450ms' }}
          >
            <CuradosBanner
              title="Cuidados del Mate"
              text="Te recomendamos cómo cuidar y mantener tu mate para disfrutarlo por más tiempo."
              imageUrl="/Necesito_crear_una_imagen_para_un_banner_de_una_pa-removebg-preview.png"
            />
          </div>

          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[4] = el}
            style={{ animationDelay: '600ms' }}
          >
            <SectionDividerImage 
              src="/divisor-beige.jpg" 
              alt="Divisor decorativo animado - Separador de secciones" 
              height="50px" 
            />
          </div>

          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[5] = el}
            style={{ animationDelay: '750ms' }}
          >
            <Content
              title="Seguinos en nuestras redes"
              color1="#b7c774"
              color2="#52691a"
              colorTitle="#52691a"
            />
          </div>

          <div 
            className={`fade-section ${prefersReducedMotion ? 'no-motion' : ''}`}
            ref={(el) => sectionRefs.current[6] = el}
            style={{ animationDelay: '900ms' }}
          >
            <InstagramFeed background="#000000ff" />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Home;