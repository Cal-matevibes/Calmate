import React from 'react';
import { Link } from 'react-router-dom';

function MobileMenu({ 
  isOpen, 
  isAuthenticated, 
  user, 
  isAdmin, 
  adminDropdownOpen, 
  setAdminDropdownOpen,
  adminDropdownRef,
  closeMobileMenu, 
  handleLogout,
  menuRef 
}) {
  return (
    <nav className={`header-nav ${isOpen ? 'open' : ''}`} ref={menuRef}>
      {/* User Section in Mobile Menu - TOP */}
      <div className="mobile-user-section mobile-user-top">
        {isAuthenticated ? (
          <>
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
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
              </div>
              <div className="mobile-user-details">
                <span className="mobile-user-name">{user?.nombre} {user?.apellido}</span>
                <span className="mobile-user-email">{user?.email}</span>
              </div>
            </div>
            <Link
              to="/profile"
              className="nav-link mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Mi Perfil
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="nav-link mobile-nav-link"
            onClick={closeMobileMenu}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="user-icon"
              style={{ marginRight: '0.5rem' }}
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
            Ingresar
          </Link>
        )}
      </div>

      <div className="mobile-nav-divider"></div>

      {/* Navigation Links */}
      <Link to="/catalog" className="nav-link" onClick={closeMobileMenu}>
        Catálogo
      </Link>
      <Link to="/care" className="nav-link" onClick={closeMobileMenu}>
        Cuidados
      </Link>
      <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>
        Contacto
      </Link>
      <Link to="/mis-pedidos" className="nav-link" onClick={closeMobileMenu}>
        Mis Pedidos
      </Link>

      {/* Admin Dropdown */}
      {isAuthenticated && isAdmin && (
        <div className="admin-dropdown" ref={adminDropdownRef}>
          <button
            className="nav-link admin-link dropdown-toggle"
            onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
            aria-label="Menú de administración"
          >
            Admin
            <svg
              className={`dropdown-arrow ${adminDropdownOpen ? 'open' : ''}`}
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {adminDropdownOpen && (
            <div className="admin-dropdown-menu">
              <Link
                to="/stock"
                className="admin-dropdown-item"
                onClick={() => {
                  setAdminDropdownOpen(false);
                  closeMobileMenu();
                }}
              >
                Stock
              </Link>
              <Link
                to="/pedidos"
                className="admin-dropdown-item"
                onClick={() => {
                  setAdminDropdownOpen(false);
                  closeMobileMenu();
                }}
              >
                Pedidos
              </Link>
              <Link
                to="/ventas"
                className="admin-dropdown-item"
                onClick={() => {
                  setAdminDropdownOpen(false);
                  closeMobileMenu();
                }}
              >
                Ventas
              </Link>
              <Link
                to="/cuidados-admin"
                className="admin-dropdown-item"
                onClick={() => {
                  setAdminDropdownOpen(false);
                  closeMobileMenu();
                }}
              >
                Cuidados
              </Link>
              <Link
                to="/colaboradores"
                className="admin-dropdown-item"
                onClick={() => {
                  setAdminDropdownOpen(false);
                  closeMobileMenu();
                }}
              >
                Colaboradores
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Section - BOTTOM */}
      {isAuthenticated && (
        <div className="mobile-user-section mobile-user-bottom">
          <div className="mobile-nav-divider"></div>
          <button
            className="nav-link mobile-nav-link logout-link"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default MobileMenu;
