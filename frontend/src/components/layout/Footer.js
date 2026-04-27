import React from 'react';
import '../styles/Footer.css';

function Footer() {
  const formatText = (text) => {
    return text.replace(/(M)(ate)/gi, '<span class="special-m">m</span><span class="special-rest">ate</span>');
  };

  const year = new Date().getFullYear(); // Obtén el año actual

  return (
    <footer className="main-footer">
      <div className="container text-center">
        <p>
          <p
            dangerouslySetInnerHTML={{
              __html: formatText(`Cal-mate web. Todos los derechos reservados. © ${year}`),
            }}
          ></p>
        </p>
        <div>
          <a
            href="https://www.instagram.com/calmatevibes/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-instagram"
            aria-label="Instagram"
          >
            <i className="bi bi-instagram"></i>
          </a>
          <a
            href="https://wa.me/5492804666566"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-whatsapp"
            aria-label="WhatsApp"
            style={{ marginLeft: '18px' }}
          >
            <i className="bi bi-whatsapp"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;