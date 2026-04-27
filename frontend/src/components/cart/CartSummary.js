import React from 'react';
import './styles/CartSummary.css';

function CartSummary({
    items = [],
    itemCount = 0,
    subtotal = 0,
    total = 0,
    envio = 0,
    onClearCart,
    customerInfo,
    isReadOnly = false,
    showShipping = false,
    currentStep = 'cart'
}) {
    const formatPrice = (price) => {
        const numPrice = Number(price) || 0;
        return `$${numPrice.toLocaleString()}`;
    };
    
    // Calcular el subtotal desde los items como backup
    const calculatedSubtotal = items.reduce((sum, item) => {
        const precio = item.precioUnitario || item.precioVenta || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    
    // Usar el subtotal pasado como prop o el calculado como fallback
    const realSubtotal = subtotal || calculatedSubtotal;
    
    // Debug: mostrar los valores en consola
    console.log('🧮 CartSummary Debug:', {
        items: items.length,
        subtotalProp: subtotal,
        calculatedSubtotal,
        realSubtotal,
        envio,
        showShipping,
        finalTotal: showShipping ? realSubtotal + envio : realSubtotal
    });
    
    // Calcular el total correctamente
    // Si showShipping es true: subtotal + envío
    // Si showShipping es false: solo subtotal  
    const finalTotal = showShipping ? realSubtotal + envio : realSubtotal;

    return (
        <div className="cart-summary">
            {/* Vista móvil - Total simple (como en Cart línea 164) */}
            <div className="mobile-summary">
                <div className="cart-total-display">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">{formatPrice(finalTotal)}</span>
                </div>
            </div>

            {/* Vista desktop - oculta en móvil */}
            <div className="desktop-summary">
                <h3 className="cart-summary-title">Resumen del Pedido</h3>

                <div className="cart-summary-content">
                    {/* Productos listados */}
                    {items && items.length > 0 && (
                        <div className="products-list">
                            <h4 className="products-list-title">Productos ({itemCount})</h4>
                            {items.map((item, index) => (
                                <div key={index} className="product-item">
                                    <span className="product-name">
                                        {item.cantidad}x {item.nombre}
                                    </span>
                                    <span className="product-price">
                                        {formatPrice((item.precioUnitario || item.precioVenta || 0) * (item.cantidad || 1))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="summary-line">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">{formatPrice(realSubtotal)}</span>
                    </div>

                    {showShipping && (
                        <>
                            <div className="summary-line">
                                <span className="summary-label">Envío</span>
                                <span className={`summary-value ${envio === 0 ? 'free-shipping' : ''}`}>
                                    {envio === 0 ? 'GRATIS' : formatPrice(envio)}
                                </span>
                            </div>

                            {envio === 0 && (
                                <div className="free-shipping-note">
                                    <i className="bi bi-truck"></i>
                                    <span>¡Envío gratis en compras superiores a $35,000!</span>
                                </div>
                            )}
                        </>
                    )}

                    {!showShipping && (
                        <div className="shipping-pending">
                            <i className="bi bi-info-circle"></i>
                            <span>El costo de envío se calculará con la dirección</span>
                        </div>
                    )}

                    <div className="summary-line total-line">
                        <span className="summary-label">Total</span>
                        <span className="summary-value total-value">
                            {formatPrice(finalTotal)}
                        </span>
                    </div>

                    {/* Customer Info Display (for review steps) */}
                    {customerInfo && (
                        <div className="customer-info-summary">
                            <h4>Información de Envío</h4>
                            <div className="customer-details">
                                <p><strong>{customerInfo.nombre}</strong></p>
                                <p>{customerInfo.email}</p>
                                <p>{customerInfo.telefono}</p>
                                <p>{customerInfo.direccion}</p>
                                <p>{customerInfo.ciudad}, CP: {customerInfo.codigoPostal}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!isReadOnly && (
                        <div className="cart-summary-actions">
                            <button
                                type="button"
                                className="btn-clear-cart"
                                onClick={onClearCart}
                            >
                                <i className="bi bi-trash3"></i>
                                Vaciar Carrito
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CartSummary;