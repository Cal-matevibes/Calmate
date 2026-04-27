// src/components/cart/EmptyCart.js
import React from 'react';
import { Link } from 'react-router-dom';
import './styles/EmptyCart.css';

function EmptyCart() {
    return (
        <div className="empty-cart">
            <div className="empty-cart-content">
                <div className="empty-cart-icon">
                    <i className="bi bi-cart-x"></i>
                </div>
                
                <h2 className="empty-cart-title">Tu carrito está vacío</h2>
                
                <p className="empty-cart-message">
                    ¡No te preocupes! Descubrí nuestra increíble selección de mates, bombillas y combos.
                </p>

                <div className="empty-cart-actions">
                    <Link to="/" className="btn-continue-shopping primary">
                        <i className="bi bi-house"></i>
                        Ir al Inicio
                    </Link>
                    <Link to="/catalog" className="btn-continue-shopping secondary">
                        <i className="bi bi-grid"></i>
                        Ver Catálogo Completo
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EmptyCart;