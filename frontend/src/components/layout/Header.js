import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CarritoIcono from '../shared/CarritoIcono.js';
import MobileMenu from './MobileMenu.js';
import '../styles/Header.css';

function Header() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const adminDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const hamburgerButton = document.querySelector('.hamburger-button');
        if (hamburgerButton && !hamburgerButton.contains(event.target)) {
          setMobileMenuOpen(false);
        }
      }
    };

    if (adminDropdownOpen || userDropdownOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [adminDropdownOpen, userDropdownOpen, mobileMenuOpen]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
  };

  return (
    <header className="header-main">
      {/* Overlay para cuando el menú móvil está abierto */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}
      
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img
            src="/cal.mate beige.png"
            alt="Logo CalmateVibes"
            className="logo-image"
          />
        </Link>

        {/* Mobile Menu Component */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          isAuthenticated={isAuthenticated}
          user={user}
          isAdmin={isAdmin}
          adminDropdownOpen={adminDropdownOpen}
          setAdminDropdownOpen={setAdminDropdownOpen}
          adminDropdownRef={adminDropdownRef}
          closeMobileMenu={closeMobileMenu}
          handleLogout={handleLogout}
          menuRef={mobileMenuRef}
        />

        {/* Right Section: User Icon, Cart and Hamburger Menu */}
        <div className="header-right">
          {/* User Dropdown */}
          <div className="user-dropdown" ref={userDropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  className="user-icon-button authenticated"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Menú de usuario"
                >
                  <div className="user-avatar">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="user-icon"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        fill="currentColor"
                      />
                      <path
                        d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
                        fill="currentColor"
                      />
                    </svg>
                    <div className="online-indicator"></div>
                  </div>
                  <span className="user-name">{user?.nombre}</span>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-info">
                      <div className="user-details">
                        <span className="user-full-name">{user?.nombre} {user?.apellido}</span>
                        <span className="user-email-dropdown">{user?.email}</span>
                        {isAdmin && <span className="user-role">Administrador</span>}
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/mis-pedidos"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                    <Link
                      to="/profile"
                      className="user-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="user-dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="user-icon-button">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="user-icon"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="login-text">Ingresar</span>
              </Link>
            )}
          </div>
          
          {/* Cart Icon */}
          <CarritoIcono />
          
          {/* Hamburger Menu Button */}
          <button
            className={`hamburger-button ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú de navegación"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;