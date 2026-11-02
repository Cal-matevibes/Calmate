// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { useCarrito } from '../context/CarritoContext.js';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header.js';
import Footer from '../components/layout/Footer.js';
import CartItems from '../components/cart/CartItems.js';
import CartSummary from '../components/cart/CartSummary.js';
import EmptyCart from '../components/cart/EmptyCart.js';
import CheckoutForm from '../components/cart/CheckoutForm.js';
import PaymentMethod from '../components/cart/PaymentMethod.js';
import { crearPreferenciaPago, formatearDatosOrden } from '../services/pagoService';
import { calcularCostoEnvio } from '../utils/shipping';
import '../components/cart/styles/Cart.css';
import Loading from '../components/shared/Loading';

function Cart() {
    const { carrito, eliminarDelCarrito, vaciarCarrito, actualizarCantidad, loading, error, total: carritoTotal } = useCarrito();
    const { user, token } = useAuth();
    const [currentStep, setCurrentStep] = useState('cart'); // cart, checkout, payment
    const [customerInfo, setCustomerInfo] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        pais: 'Argentina',
        provincia: '',
        ciudad: '',      
        codigoPostal: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('mercadopago'); // mercadopago, whatsapp
    const [isLoading, setIsLoading] = useState(false);

    // Recalcular siempre a partir de los items actuales del carrito: carritoTotal del contexto
    // puede quedar desincronizado (stale) tras cambios de cantidad, provocando un envío mal calculado
    const totalCalculado = carrito.reduce((sum, item) => {
        const precio = item.precioUnitario || item.precioVenta || item.precio || 0;
        return sum + precio * item.cantidad;
    }, 0);
    const total = carrito.length > 0 ? totalCalculado : (carritoTotal || 0);
    const envio = calcularCostoEnvio(carrito, total);
    const totalConEnvio = total + envio;

    // Función para avanzar al checkout
    const handleProceedToCheckout = () => {
        setCurrentStep('checkout');
    };

    // Función para retroceder al carrito
    const handleBackToCart = () => {
        setCurrentStep('cart');
    };

    // Función para proceder al pago
    const handleProceedToPayment = (formData) => {
        setCustomerInfo(formData);
        setCurrentStep('payment');
    };

    // Función para generar orden
    const generateOrder = () => {
        return {
            id: `ORDER-${Date.now()}`,
            items: carrito.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precioUnitario || item.precioVenta || item.precio || 0,
                cantidad: item.cantidad,
                imagen: item.imagen
            })),
            customer: customerInfo,
            subtotal: total,
            envio: envio,
            total: totalConEnvio,
            fecha: new Date().toISOString(),
            estado: 'pending'
        };
    };

    // Función para manejar el pago con MercadoPago
    const handleMercadoPagoPayment = async () => {
        setIsLoading(true);
        try {
            const order = generateOrder();

            // Formatear datos para MercadoPago
            const datosOrden = formatearDatosOrden(
                {
                    items: order.items,
                    subtotal: order.subtotal,
                    total: order.total,
                    id: `carrito_${Date.now()}`
                },
                order.customer,
                {
                    costo: order.envio || 0,
                    descuento: order.descuento || 0,
                    metodo: 'standard',
                    direccion: order.customer.direccion,
                    ciudad: order.customer.ciudad,
                    provincia: order.customer.provincia,
                    pais: order.customer.pais,
                    codigoPostal: order.customer.codigoPostal
                }
            );


            // Crear preferencia de pago
            const response = await crearPreferenciaPago(datosOrden, user, token);

            if (response.success && response.initPoint) {
                
                // Guardar referencia del pago para seguimiento
                localStorage.setItem('mp_external_reference', response.externalReference);
                localStorage.setItem('mp_preference_id', response.preferenceId);
                
                // Redirigir a MercadoPago
                window.location.href = response.initPoint;
            } else {
                throw new Error(response.message || 'No se pudo crear la preferencia de pago');
            }
        } catch (error) {
            alert(`Error al procesar el pago: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para manejar compra por WhatsApp
    const handleWhatsAppPurchase = () => {
        const order = generateOrder();
        let mensaje = `¡Hola! Me gustaría realizar una compra:\n\n`;
        mensaje += `📋 *PEDIDO #${order.id}*\n\n`;

        order.items.forEach((item) => {
            mensaje += `• ${item.nombre}\n`;
            mensaje += `  Cantidad: ${item.cantidad}\n`;
            mensaje += `  Precio: $${item.precio}\n\n`;
        });

        mensaje += `*DATOS DEL CLIENTE:*\n`;
        mensaje += `Nombre: ${customerInfo.nombre} ${customerInfo.apellido || ''}\n`;
        mensaje += `Email: ${customerInfo.email}\n`;
        mensaje += `Teléfono: ${customerInfo.telefono}\n`;
        mensaje += `Dirección: ${customerInfo.direccion}\n`;
        mensaje += `Ciudad: ${customerInfo.ciudad}\n`;
        mensaje += `Código Postal: ${customerInfo.codigoPostal}\n\n`;

        mensaje += `*RESUMEN DEL PEDIDO:*\n`;
        mensaje += `Subtotal: $${order.subtotal}\n`;
        mensaje += `Envío: ${order.envio === 0 ? 'GRATIS' : `$${order.envio}`}\n`;
        mensaje += `*Total: $${order.total}*`;

        const numeroWhatsApp = '5492804666566';
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    // Efectos para scroll management
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    // Mostrar loading mientras se carga el carrito
    if (loading && carrito.length === 0) {
        return (
            <div className="cart-page-wrapper">
                <Header />
                <div className="page-loading-center">
                    <Loading text="Cargando tu carrito..." />
                </div>
                <Footer />
            </div>
        );
    }

    // Mostrar error si hay algún problema
    if (error) {
        return (
            <div className="cart-page-wrapper">
                <Header />
                <div className="cart-content-container">
                    <div className="cart-error">
                        <h2>Error al cargar el carrito</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-button">
                            Intentar nuevamente
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-page-wrapper">
            <Header />

            <div className="cart-content-container">
                <div className="cart-progress">
                    <div className={`progress-step ${currentStep === 'cart' ? 'active' : currentStep !== 'cart' ? 'completed' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Carrito</span>
                    </div>
                    <div className={`progress-step ${currentStep === 'checkout' ? 'active' : currentStep === 'payment' ? 'completed' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Datos</span>
                    </div>
                    <div className={`progress-step ${currentStep === 'payment' ? 'active' : ''}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Pago</span>
                    </div>
                </div>

                <h1 className="cart-title">
                    {currentStep === 'cart' && 'Carrito de Compras'}
                    {currentStep === 'checkout' && 'Información de Envío'}
                    {currentStep === 'payment' && 'Método de Pago'}
                </h1>

                {currentStep === 'cart' && carrito.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="cart-step-layout">
                        <main className="cart-step-main">
                            {currentStep === 'cart' && (
                                <div className="cart-step-panel">
                                    <CartItems
                                        items={carrito}
                                        onUpdateQuantity={actualizarCantidad}
                                        onRemoveItem={eliminarDelCarrito}
                                    />
                                    <div className="cart-step-actions">
                                        <button
                                            className="checkout-btn-continue"
                                            onClick={handleProceedToCheckout}
                                        >
                                            Continuar Compra
                                            <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 'checkout' && (
                                <div className="cart-step-panel">
                                    <CheckoutForm
                                        initialData={customerInfo}
                                        onSubmit={handleProceedToPayment}
                                        onBack={handleBackToCart}
                                    />
                                </div>
                            )}

                            {currentStep === 'payment' && (
                                <div className="cart-step-panel">
                                    <PaymentMethod
                                        selectedMethod={paymentMethod}
                                        onMethodChange={setPaymentMethod}
                                        onMercadoPagoPayment={handleMercadoPagoPayment}
                                        onWhatsAppPurchase={handleWhatsAppPurchase}
                                        onBack={() => setCurrentStep('checkout')}
                                        isLoading={isLoading}
                                        total={totalConEnvio}
                                        customerInfo={customerInfo}
                                    />
                                </div>
                            )}
                        </main>

                        <aside className={`cart-summary-section ${currentStep !== 'cart' ? 'cart-summary-section--mobile-hidden' : ''}`}>
                            <CartSummary
                                subtotal={total}
                                envio={envio}
                                total={totalConEnvio}
                                itemCount={carrito.length}
                                items={carrito}
                                onClearCart={vaciarCarrito}
                                customerInfo={currentStep === 'payment' ? customerInfo : undefined}
                                isReadOnly={currentStep !== 'cart'}
                                showShipping={true}
                                currentStep={currentStep}
                            />
                        </aside>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Cart;