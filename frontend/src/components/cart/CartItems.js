// src/components/cart/CartItems.js
import React from 'react';
import './styles/CartItems.css';

function CartItems({ items, onUpdateQuantity, onRemoveItem }) {
    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= 99) {
            onUpdateQuantity(itemId, newQuantity);
        }
    };

    return (
        <div className="cart-items">            
            <div className="cart-items-list">
                {items.map((item) => (
                    <div key={item._id || item.id || item.producto?._id} className="cart-item">
                        {/* Primera sección: Imagen y detalles del producto */}
                        <div className="cart-item-product">
                            <div className="cart-item-image">
                                <img 
                                    src={
                                        // Si la imagen es un string directo (procesado por el contexto)
                                        item.imagen || 
                                        // Si es array de objetos con url
                                        item.imagenes?.[0]?.url || 
                                        // Si es array de strings
                                        item.imagenes?.[0] || 
                                        // Fallbacks del producto poblado
                                        item.producto?.imagenes?.[0]?.url || 
                                        item.producto?.imagenes?.[0] || 
                                        item.producto?.imagen || 
                                        '/placeholder.svg'
                                    } 
                                    alt={item.nombre || item.producto?.nombre}
                                    onError={(e) => {
                                        e.target.src = '/placeholder.svg';
                                    }}
                                />
                            </div>
                            
                            <div className="cart-item-details">
                                <h3 className="cart-item-name">{item.nombre || item.producto?.nombre}</h3>
                                <p className="cart-item-category">{item.categoria || item.producto?.categoria || 'Productos'}</p>
                                <p className="cart-item-price">
                                    <span className="price-label">Precio unitario:</span>
                                    <span className="price-value">
                                        ${(item.precioUnitario || item.precioVenta || item.producto?.precioVenta || 0).toLocaleString()}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Segunda sección: Controles (cantidad, subtotal, eliminar) */}
                        <div className="cart-item-controls">
                            <div className="cart-quantity-controls">
                                <label htmlFor={`quantity-${item._id || item.id || item.producto?._id}`} className="cart-quantity-label">
                                    Cantidad:
                                </label>
                                <div className="cart-quantity-input-group">
                                    <button
                                        type="button"
                                        className="cart-quantity-btn cart-quantity-decrease"
                                        onClick={() => handleQuantityChange(item.producto?._id || item._id || item.id, item.cantidad - 1)}
                                        disabled={item.cantidad <= 1}
                                        aria-label="Disminuir cantidad"
                                    >
                                        <i className="bi bi-dash"></i>
                                    </button>
                                    
                                    <input
                                        id={`quantity-${item._id || item.id || item.producto?._id}`}
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={item.cantidad || 1}
                                        onChange={(e) => handleQuantityChange(item.producto?._id || item._id || item.id, parseInt(e.target.value) || 1)}
                                        className="cart-quantity-input"
                                        aria-label={`Cantidad de ${item.nombre || item.producto?.nombre}`}
                                    />
                                    
                                    <button
                                        type="button"
                                        className="cart-quantity-btn cart-quantity-increase"
                                        onClick={() => handleQuantityChange(item.producto?._id || item._id || item.id, item.cantidad + 1)}
                                        disabled={item.cantidad >= 99}
                                        aria-label="Aumentar cantidad"
                                    >
                                        <i className="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="cart-item-subtotal">
                                <span className="subtotal-label">Subtotal:</span>
                                <span className="subtotal-value">
                                    ${((item.precioUnitario || item.precioVenta || item.producto?.precioVenta || 0) * (item.cantidad || 1)).toLocaleString()}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="remove-item-btn"
                                onClick={() => onRemoveItem(item.producto?._id || item._id || item.id)}
                                aria-label={`Eliminar ${item.nombre || item.producto?.nombre} del carrito`}
                            >
                                <i className="bi bi-trash3"></i>
                                <span>Eliminar</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CartItems;