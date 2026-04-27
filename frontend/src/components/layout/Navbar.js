import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link className="navbar-brand" to="/">Mi Sitio</Link>
                <Navbar />
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/about">Sobre Nosotros</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/contact">Contacto</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
